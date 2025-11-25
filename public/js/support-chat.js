let ws;
let connected = false;
let username = '';
let roomId = null;

const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const startChatBtn = document.getElementById('startChatBtn');

function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}`);
    
    ws.onopen = () => {
        connected = true;
        statusIndicator.classList.add('connected');
        statusText.textContent = 'Conectado';
        messageInput.disabled = false;
        sendBtn.disabled = false;

        // Unirse como usuario
        ws.send(JSON.stringify({
            type: 'join',
            role: 'user',
            username: username,
            roomId: roomId
        }));
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'joined') {
                roomId = data.roomId;
                addSystemMessage(data.message);
            } else if (data.type === 'message') {
                addMessage(data.username, data.text, data.timestamp, data.role);
            } else if (data.type === 'system') {
                addSystemMessage(data.text);
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
        }
    };
    
    ws.onclose = () => {
        connected = false;
        statusIndicator.classList.remove('connected');
        statusText.textContent = 'Desconectado - Reconectando...';
        messageInput.disabled = true;
        sendBtn.disabled = true;
        
        // Intentar reconectar después de 3 segundos
        setTimeout(connect, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('Error WebSocket:', error);
    };
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
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}

function addSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message system';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p class="message-text">${escapeHtml(text)}</p>`;
    
    msgDiv.appendChild(contentDiv);
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    
    if (!text) {
        messageInput.focus();
        return;
    }
    
    if (!connected) {
        alert('No hay conexión al servidor');
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'message',
        username: username,
        text: text
    }));
    
    messageInput.value = '';
    messageInput.focus();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function startChat() {
    const name = usernameInput.value.trim();
    
    if (!name) {
        alert('Por favor ingresa tu nombre');
        usernameInput.focus();
        return;
    }
    
    username = name;
    usernameModal.classList.add('hidden');
    
    // Conectar al WebSocket
    connect();
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

startChatBtn.addEventListener('click', startChat);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startChat();
    }
});

// Focus inicial en el input de nombre
usernameInput.focus();
