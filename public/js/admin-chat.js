let ws;
let connected = false;
let currentRoomId = null;
let activeChats = new Map();

const chatListItems = document.getElementById('chatListItems');
const noChatSelected = document.getElementById('noChatSelected');
const chatInterface = document.getElementById('chatInterface');
const chatMessages = document.getElementById('chatMessages');
const adminMessageInput = document.getElementById('adminMessageInput');
const adminSendBtn = document.getElementById('adminSendBtn');
const chatUsername = document.getElementById('chatUsername');

function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);
    
    ws.onopen = () => {
        connected = true;
        console.log('Conectado como administrador');

        // Unirse como admin
        ws.send(JSON.stringify({
            type: 'join',
            role: 'admin',
            username: 'Administrador'
        }));
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'admin_connected') {
                // Recibir lista de chats activos
                updateChatList(data.activeChats);
            } else if (data.type === 'new_chat') {
                // Nuevo chat iniciado por un usuario
                addChatToList(data.roomId, data.username, data.cedula);
            } else if (data.type === 'room_joined') {
                // Admin se unió exitosamente a una sala
                console.log('Unido a sala:', data.roomId);
            } else if (data.type === 'message') {
                // Mensaje recibido en la sala actual
                if (currentRoomId) {
                    addMessage(data.username, data.text, data.timestamp, data.role);
                }
            } else if (data.type === 'system') {
                // Mensaje del sistema
                if (currentRoomId) {
                    addSystemMessage(data.text);
                }
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    };
    
    ws.onclose = () => {
        connected = false;
        console.log('Desconectado - Reconectando...');
        
        // Intentar reconectar
        setTimeout(connect, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
    };
}

function updateChatList(chats) {
    if (chats.length === 0) {
        chatListItems.innerHTML = '<div class="empty-state"><p>No hay chats activos</p></div>';
        return;
    }

    chatListItems.innerHTML = '';
    chats.forEach(chat => {
        addChatToList(chat.roomId, chat.username, chat.cedula);
        activeChats.set(chat.roomId, { username: chat.username, cedula: chat.cedula });
    });
}

function addChatToList(roomId, username, cedula = '') {
    // Evitar duplicados
    if (document.getElementById(`chat-${roomId}`)) {
        return;
    }

    // Eliminar empty state si existe
    const emptyState = chatListItems.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.id = `chat-${roomId}`;
    chatItem.innerHTML = `
        <div class="chat-item-name">${username}</div>
        <div class="chat-item-preview">${cedula ? `CI: ${cedula}` : 'Nuevo chat de soporte'}</div>
    `;
    
    chatItem.addEventListener('click', () => {
        selectChat(roomId, username);
    });
    
    chatListItems.appendChild(chatItem);
    activeChats.set(roomId, { username, cedula });
}

function selectChat(roomId, username) {
    currentRoomId = roomId;
    
    // Actualizar UI
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`chat-${roomId}`).classList.add('active');
    
    // Mostrar interfaz de chat
    noChatSelected.style.display = 'none';
    chatInterface.style.display = 'flex';
    chatUsername.textContent = username;
    
    // Limpiar mensajes
    chatMessages.innerHTML = '';
    
    // Habilitar input
    adminMessageInput.disabled = false;
    adminSendBtn.disabled = false;
    adminMessageInput.focus();
    
    // Unirse a la sala
    ws.send(JSON.stringify({
        type: 'admin_join_room',
        roomId: roomId
    }));
}

function addMessage(sender, text, timestamp, role) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    contentDiv.innerHTML = `
        <span class="username">${sender}</span>
        <p class="message-text">${escapeHtml(text)}</p>
        <span class="message-time">${timestamp}</span>
    `;
    
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message system';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p class="message-text">${escapeHtml(text)}</p>`;
    
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const text = adminMessageInput.value.trim();
    
    if (!text) {
        adminMessageInput.focus();
        return;
    }
    
    if (!connected || !currentRoomId) {
        alert('No hay conexión o no has seleccionado un chat');
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'message',
        username: 'Administrador',
        text: text
    }));
    
    adminMessageInput.value = '';
    adminMessageInput.focus();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
adminSendBtn.addEventListener('click', sendMessage);

adminMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Conectar al iniciar
connect();
