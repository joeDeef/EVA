// Voter Login Logic
let currentStep = 1;

const step1Form = document.getElementById('step1-form');
const step2Form = document.getElementById('step2-form');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');
const stepIndicator = document.getElementById('step-indicator');
const backBtn = document.getElementById('back-btn');

// Step 1 Submit
step1Form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const cedula = document.getElementById('cedula').value;
  const codigoDactilar = document.getElementById('codigoDactilar').value;
  
  // Validation
  if (cedula.length !== 10) {
    showError('El número de cédula debe tener 10 dígitos');
    return;
  }
  
  try {
    const response = await fetch('/api/voter-auth-step1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cedula, codigoDactilar })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Cédula válida, avanzando al paso 2');
      hideError();
      goToStep2();
    } else {
      console.log('Error en la autenticación:', data.message);
      showError(data.message || 'Error en la autenticación');
    }
  } catch (error) {
    showError('Error de conexión. Intente nuevamente.');
  }
});

// Step 2 Submit
step2Form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const codigoEmail = document.getElementById('codigoEmail').value;
  
  if (codigoEmail.length !== 6) {
    showError('El código debe tener 6 dígitos');
    return;
  }
  
  try {
    const response = await fetch('/api/voter-auth-step2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoEmail })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token
      sessionStorage.setItem('voter-token', data.token);
      // Redirect to instructions
      window.location.href = '/voting-instructions';
    } else {
      showError(data.message || 'Código inválido');
    }
  } catch (error) {
    showError('Error de conexión. Intente nuevamente.');
  }
});

// Back button
backBtn.addEventListener('click', () => {
  goToStep1();
});

// Helper functions
function goToStep2() {
  currentStep = 2;
  step1Form.classList.add('hidden');
  step2Form.classList.remove('hidden');
  stepIndicator.textContent = 'Paso 2 de 2';
}

function goToStep1() {
  currentStep = 1;
  step2Form.classList.add('hidden');
  step1Form.classList.remove('hidden');
  stepIndicator.textContent = 'Paso 1 de 2';
  document.getElementById('codigoEmail').value = '';
}

function showError(message) {
  errorMessage.textContent = message;
  errorAlert.classList.remove('hidden');
}

function hideError() {
  errorAlert.classList.add('hidden');
}

// Only allow numbers for cedula
document.getElementById('cedula').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Only allow numbers for codigo email
document.getElementById('codigoEmail').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});
