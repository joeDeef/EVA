// Voting Logic
const candidateCards = document.querySelectorAll('.candidate-card');
const confirmBtn = document.getElementById('confirm-btn');
const timerElement = document.getElementById('timer');
const timerIcon = document.getElementById('timer-icon');
const timerContainer = document.getElementById('timer-container');

let selectedCandidate = null;
let timeLeft = 600; // 10 minutes in seconds

// Check authentication
const voterToken = sessionStorage.getItem('voter-token');
if (!voterToken) {
  window.location.href = '/voter-login';
}

// Timer countdown
const timerInterval = setInterval(() => {
  timeLeft--;
  
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    alert('Tiempo agotado. Su sesión ha expirado.');
    window.location.href = '/';
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
  const iconColor = timeLeft > 300 ? 'var(--success)' : timeLeft > 120 ? 'var(--warning)' : 'var(--destructive)';
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

// Candidate selection
candidateCards.forEach(card => {
  card.addEventListener('click', () => {
    const radio = card.querySelector('input[type="radio"]');
    radio.checked = true;
    selectedCandidate = card.dataset.candidateId;
    
    // Update UI
    candidateCards.forEach(c => {
      c.style.borderColor = 'var(--border)';
      c.style.background = 'var(--card)';
    });
    
    card.style.borderColor = 'var(--primary)';
    card.style.background = 'hsl(215, 85%, 98%)';
    card.style.boxShadow = 'var(--hover-shadow)';
    
    confirmBtn.disabled = false;
  });
});

// Confirm button
confirmBtn.addEventListener('click', () => {
  if (selectedCandidate) {
    // Store selection and redirect to confirmation
    sessionStorage.setItem('selected-candidate', selectedCandidate);
    window.location.href = '/vote-confirmation';
  }
});
