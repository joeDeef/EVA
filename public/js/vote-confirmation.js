// Vote Confirmation Logic
const candidates = {
  '1': { name: 'María Elena Rodríguez', party: 'Partido Nacional', number: '100' },
  '2': { name: 'Carlos Alberto Mendoza', party: 'Partido Liberal', number: '200' },
  '3': { name: 'Ana Patricia Silva', party: 'Partido Progresista', number: '300' },
  '4': { name: 'Roberto Martín Torres', party: 'Partido Democrático', number: '400' }
};

const selectedCandidateId = sessionStorage.getItem('selected-candidate');
const finalConfirmation = document.getElementById('final-confirmation');
const confirmBtn = document.getElementById('confirm-btn');
const backBtn = document.getElementById('back-btn');

// Check authentication and selection
if (!sessionStorage.getItem('voter-token') || !selectedCandidateId) {
  window.location.href = '/voter-login';
}

// Display selected candidate
const candidate = candidates[selectedCandidateId];
if (candidate) {
  document.getElementById('candidate-name').textContent = candidate.name;
  document.getElementById('candidate-party').textContent = candidate.party;
  document.getElementById('candidate-number').textContent = candidate.number;
} else {
  window.location.href = '/voting';
}

// Enable confirm button when checkbox is checked
finalConfirmation.addEventListener('change', () => {
  confirmBtn.disabled = !finalConfirmation.checked;
});

// Confirm vote
confirmBtn.addEventListener('click', async () => {
  if (!finalConfirmation.checked) return;
  
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('voter-token')}`
      },
      body: JSON.stringify({ candidateId: selectedCandidateId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Clear selection
      sessionStorage.removeItem('selected-candidate');
      // Redirect to success page
      window.location.href = '/vote-success';
    } else {
      alert('Error al registrar el voto. Intente nuevamente.');
    }
  } catch (error) {
    alert('Error de conexión. Intente nuevamente.');
  }
});

// Back button
backBtn.addEventListener('click', () => {
  window.location.href = '/voting';
});
