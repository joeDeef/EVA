// Voting Logic
const candidateCards = document.querySelectorAll('.candidate-card');
const confirmBtn = document.getElementById('confirm-btn');
const timerElement = document.getElementById('timer');
const timerIcon = document.getElementById('timer-icon');
const timerContainer = document.getElementById('timer-container');

let selectedCandidate = null;

// =====================================================
//      FUNCIONES DE ENVÍO DE VOTO
// =====================================================

/**
 * Envía el voto al servidor
 * @param {string} candidateId - ID del candidato (o null para voto en blanco)
 */
async function submitVote(candidateId) {
  try {
    // Si no hay candidato seleccionado, usar ID 5 para voto en blanco
    const voteId = candidateId || '5';
    
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('voter-token')}`
      },
      body: JSON.stringify({ candidateId: voteId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      sessionStorage.removeItem('selected-candidate');
      sessionStorage.removeItem('voting-start-time');
      window.location.href = '/vote-success';
    } else {
      alert('Error al registrar el voto. Intente nuevamente.');
    }
  } catch (error) {
    alert('Error de conexión. Intente nuevamente.');
  }
}

/**
 * Maneja el voto automático cuando el tiempo se agota
 */
async function handleAutomaticVote() {
  // Si hay un candidato seleccionado, votar por él
  // Si no hay candidato seleccionado, votar en blanco (ID 5)
  const candidateToVote = selectedCandidate || null;
  
  // Ocultar modal si está abierto
  const modal = document.getElementById('confirmation-modal');
  if (modal && modal.style.display === 'flex') {
    hideConfirmationModal();
  }
  
  // Mostrar mensaje indicando que se está procesando el voto automáticamente
  const body = document.body;
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
    font-size: 1.5rem;
    text-align: center;
  `;
  
  if (candidateToVote) {
    const candidate = candidates[candidateToVote];
    overlay.innerHTML = `
      <div>
        <div style="margin-bottom: 1rem;">⏰ Tiempo agotado</div>
        <div>Registrando su voto por: <strong>${candidate.name}</strong></div>
      </div>
    `;
  } else {
    overlay.innerHTML = `
      <div>
        <div style="margin-bottom: 1rem;">⏰ Tiempo agotado</div>
        <div>Registrando <strong>voto en blanco</strong></div>
      </div>
    `;
  }
  
  body.appendChild(overlay);
  
  // Enviar el voto automáticamente
  await submitVote(candidateToVote);
}

// =====================================================
//      ⏳ CRONÓMETRO PERSISTENTE (5 minutos)
// =====================================================

// 10 minutos = 300 segundos
const TIEMPO_MAX = 300;

// Crear el inicio si no existe
if (!sessionStorage.getItem("voting-start-time")) {
  sessionStorage.setItem("voting-start-time", Date.now());
}

// Obtener el inicio y calcular tiempo restante según el reloj real
const inicio = parseInt(sessionStorage.getItem("voting-start-time"));
const ahora = Date.now();
let timeLeft = TIEMPO_MAX - Math.floor((ahora - inicio) / 1000);

// Si el usuario ya excedió el tiempo antes de cargar la página
if (timeLeft <= 0) {
  sessionStorage.removeItem("voting-start-time");
  handleAutomaticVote();
}

// Actualizar el display inicial
updateTimerDisplay();
updateTimerColor();

// Intervalo del cronómetro
const timerInterval = setInterval(() => {
  timeLeft--;

  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    sessionStorage.removeItem("voting-start-time");
    
    // Votar automáticamente cuando el tiempo se agota
    handleAutomaticVote();
    return;
  }

  updateTimerDisplay();
  updateTimerColor();
}, 1000);

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerColor() {
  const iconColor = timeLeft > 300
    ? 'var(--success)'
    : timeLeft > 120
    ? 'var(--warning)'
    : 'var(--destructive)';

  timerIcon.style.color = iconColor;
  timerElement.style.color = iconColor;

  if (timeLeft <= 120) {
    timerContainer.style.borderColor = 'var(--destructive)';
    timerContainer.classList.add('animate-pulse');
  } else {
    timerContainer.style.borderColor = 'var(--border)';
    timerContainer.classList.remove('animate-pulse');
  }
}

// =====================================================
//      AUTENTICACIÓN
// =====================================================
const voterToken = sessionStorage.getItem('voter-token');
if (!voterToken) {
  window.location.href = '/voter-login';
}

// =====================================================
//      CANDIDATE SELECTION
// =====================================================
candidateCards.forEach(card => {
  card.addEventListener('click', () => {
    const radio = card.querySelector('input[type="radio"]');
    radio.checked = true;
    selectedCandidate = card.dataset.candidateId;

    // Reset UI
    candidateCards.forEach(c => {
      c.style.borderColor = 'var(--border)';
      c.style.background = 'var(--card)';
    });

    // Highlight selected
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'hsl(215, 85%, 98%)';
    card.style.boxShadow = 'var(--hover-shadow)';

    confirmBtn.disabled = false;
  });
});

// =====================================================
//      MODAL ELEMENTS
// =====================================================
const modal = document.getElementById('confirmation-modal');
const modalBackBtn = document.getElementById('modal-back-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const finalConfirmation = document.getElementById('final-confirmation');

// Transformar arreglo a diccionario por ID
const candidates = {};
candidatos.forEach(c => {
  candidates[c.id] = {
    name: c.nombre,
    party: c.descripcion,
    number: c.id
  };
});

// =====================================================
//      CONFIRM BUTTON
// =====================================================
confirmBtn.addEventListener('click', () => {
  if (selectedCandidate) {
    showConfirmationModal();
  }
});

// =====================================================
//      MODAL FUNCTIONS
// =====================================================
function showConfirmationModal() {
  const candidate = candidates[selectedCandidate];
  if (candidate) {
    document.getElementById('modal-candidate-name').textContent = candidate.name;
    document.getElementById('modal-candidate-party').textContent = candidate.party;
    document.getElementById('modal-candidate-number').textContent = candidate.number;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function hideConfirmationModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  finalConfirmation.checked = false;
  modalConfirmBtn.disabled = true;
}

// =====================================================
//      MODAL EVENT LISTENERS
// =====================================================

// Cerrar modal al hacer clic fuera de él
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    hideConfirmationModal();
  }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    hideConfirmationModal();
  }
});

// Botón de volver en el modal
modalBackBtn.addEventListener('click', () => {
  hideConfirmationModal();
});

// Activar botón de confirmación en el modal
finalConfirmation.addEventListener('change', () => {
  modalConfirmBtn.disabled = !finalConfirmation.checked;
});

// Confirmar voto en el modal
modalConfirmBtn.addEventListener('click', async () => {
  if (!finalConfirmation.checked) return;
  
  await submitVote(selectedCandidate);
});
