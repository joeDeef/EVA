const WebSocket = require('ws');

class ChatHandler {
  constructor() {
    this.chatRooms = new Map(); // roomId -> { user: ws, admin: ws }
    this.userConnections = new Map(); // ws -> { role, roomId, username }
  }

  handleConnection(ws) {
    console.log('Nueva conexión WebSocket');

    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleDisconnect(ws));
    ws.on('error', (error) => console.error('Error WebSocket:', error));
  }

  handleMessage(ws, data) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'join':
          this.handleJoin(ws, message);
          break;
        case 'admin_join_room':
          this.handleAdminJoinRoom(ws, message);
          break;
        case 'message':
          this.handleChatMessage(ws, message);
          break;
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  }

  handleJoin(ws, { role, username, roomId }) {
    this.userConnections.set(ws, { role, roomId, username });

    if (role === 'user') {
      this.handleUserJoin(ws, username, roomId);
    } else if (role === 'admin') {
      this.handleAdminJoin(ws);
    }
  }

  handleUserJoin(ws, username, roomId) {
    const newRoomId = roomId || `room_${Date.now()}`;

    if (!this.chatRooms.has(newRoomId)) {
      this.chatRooms.set(newRoomId, { user: null, admin: null });
    }

    this.chatRooms.get(newRoomId).user = ws;
    this.userConnections.get(ws).roomId = newRoomId;

    this.sendMessage(ws, {
      type: 'joined',
      roomId: newRoomId,
      message: 'Conectado al chat de soporte. Un administrador te atenderá pronto.'
    });

    this.notifyAdminsNewChat(newRoomId, username);
  }

  handleAdminJoin(ws) {
    const activeChats = this.getActiveChats();
    this.sendMessage(ws, { type: 'admin_connected', activeChats });
  }

  handleAdminJoinRoom(ws, { roomId }) {
    const conn = this.userConnections.get(ws);

    if (conn?.role === 'admin' && this.chatRooms.has(roomId)) {
      this.chatRooms.get(roomId).admin = ws;
      conn.roomId = roomId;

      this.sendMessage(ws, { type: 'room_joined', roomId });

      const room = this.chatRooms.get(roomId);
      if (room.user?.readyState === WebSocket.OPEN) {
        this.sendMessage(room.user, {
          type: 'system',
          text: 'Un administrador se ha unido al chat',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }
  }

  handleChatMessage(ws, message) {
    const conn = this.userConnections.get(ws);
    if (!conn?.roomId) return;

    const room = this.chatRooms.get(conn.roomId);
    if (!room) return;

    const messageData = {
      type: 'message',
      username: message.username || conn.username,
      text: message.text,
      timestamp: new Date().toLocaleTimeString(),
      role: conn.role
    };

    // Enviar al otro participante
    const recipient = conn.role === 'user' ? room.admin : room.user;
    if (recipient?.readyState === WebSocket.OPEN) {
      this.sendMessage(recipient, messageData);
    }

    // Echo al emisor
    this.sendMessage(ws, messageData);
  }

  handleDisconnect(ws) {
    const conn = this.userConnections.get(ws);
    if (!conn?.roomId) {
      this.userConnections.delete(ws);
      console.log('Cliente desconectado');
      return;
    }

    const room = this.chatRooms.get(conn.roomId);
    if (room) {
      this.notifyDisconnect(ws, conn, room);
      this.cleanupRoom(conn, room);
    }

    this.userConnections.delete(ws);
    console.log('Cliente desconectado');
  }

  notifyDisconnect(ws, conn, room) {
    const other = conn.role === 'user' ? room.admin : room.user;
    if (other?.readyState === WebSocket.OPEN) {
      this.sendMessage(other, {
        type: 'system',
        text: `${conn.role === 'user' ? 'Usuario' : 'Administrador'} ha salido del chat`,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }

  cleanupRoom(conn, room) {
    if (conn.role === 'user') {
      room.user = null;
      if (!room.admin || room.admin.readyState !== WebSocket.OPEN) {
        this.chatRooms.delete(conn.roomId);
      }
    } else if (conn.role === 'admin') {
      room.admin = null;
      if (!room.user || room.user.readyState !== WebSocket.OPEN) {
        this.chatRooms.delete(conn.roomId);
      } else {
        // Notificar a otros admins que hay chat disponible
        this.notifyAdminsNewChat(conn.roomId, this.userConnections.get(room.user)?.username || 'Usuario');
      }
    }
  }

  notifyAdminsNewChat(roomId, username) {
    this.userConnections.forEach((conn, adminWs) => {
      if (conn.role === 'admin' && adminWs.readyState === WebSocket.OPEN) {
        this.sendMessage(adminWs, { type: 'new_chat', roomId, username });
      }
    });
  }

  getActiveChats() {
    return Array.from(this.chatRooms.entries())
      .filter(([_, room]) => room.user?.readyState === WebSocket.OPEN)
      .map(([id, room]) => ({
        roomId: id,
        username: this.userConnections.get(room.user)?.username || 'Usuario'
      }));
  }

  sendMessage(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

module.exports = ChatHandler;
