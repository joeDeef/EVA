// Formularios y elementos del DOM
const step1Form = document.getElementById('step1-form');
const step2Form = document.getElementById('step2-form');
const errorAlert = document.getElementById('error-alert');
const errorMessage = document.getElementById('error-message');
const stepIndicator = document.getElementById('step-indicator');
const backBtn = document.getElementById('back-btn');

// ====================== STEP 1 ======================
step1Form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const cedula = document.getElementById('cedula').value;
  const codigoDactilar = document.getElementById('codigoDactilar').value;

  // Validación
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
      hideError();

      // Guardar token y email en sessionStorage
      sessionStorage.setItem('voter-token', data.tokenSesion);
      sessionStorage.setItem('masked-email', data.email);

      // Pasar al paso 2
      goToStep2();
    } else {
      showError(data.message || 'Error en la autenticación');
    }
  } catch (error) {
    showError('Error de conexión. Intente nuevamente.');
  }
});

// ====================== STEP 2 ======================
step2Form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const codigoEmail = document.getElementById('codigoEmail').value;

  if (codigoEmail.length !== 8) {
    showError('El código debe tener 8 dígitos');
    return;
  }

  try {
    const token = sessionStorage.getItem('voter-token');
    const response = await fetch('/api/voter-auth-step2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoEmail, token })
    });

    const data = await response.json();

    if (data.success) {
      // Redirigir a instrucciones de votación
      window.location.href = '/voting-instructions';
    } else {
      showError(data.message || 'Código inválido');
    }
  } catch (error) {
    showError('Error de conexión. Intente nuevamente.');
  }
});

// ====================== BACK BUTTON ======================
backBtn.addEventListener('click', () => {
  goToStep1();
});

// ====================== HELPER FUNCTIONS ======================

function goToStep2() {
  step1Form.classList.add('hidden');
  step2Form.classList.remove('hidden');
  stepIndicator.textContent = 'Paso 2 de 2';

  const maskedEmail = sessionStorage.getItem('masked-email') || '******@dominio.xxx';
  document.getElementById('masked-email').textContent = maskedEmail;

  document.getElementById('code-digits').textContent = 6;

  // Mostrar botón de enviar código y ocultar área de entrada
  document.getElementById('send-code-btn').classList.remove('hidden');
  document.getElementById('code-entry-area').classList.add('hidden');

  const sendBtn = document.getElementById('send-code-btn');
  sendBtn.onclick = async () => {
    sendBtn.disabled = true;
    sendBtn.textContent = 'Enviando...';

    try {
      const token = sessionStorage.getItem('voter-token');
      const response = await fetch('/api/voter-send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const res = await response.json();
      if (res.success) {
        document.getElementById('step2-alert-title').textContent = 'Código enviado';
        document.getElementById('step2-alert-message').textContent =
          `Hemos enviado un código de verificación a ${maskedEmail}`;

        sendBtn.classList.add('hidden');
        document.getElementById('code-entry-area').classList.remove('hidden');
      } else {
        showError(res.message || 'No se pudo enviar el código.');
        sendBtn.disabled = false;
        sendBtn.textContent = 'Enviar código';
      }
    } catch (err) {
      showError('Error de conexión. Intente nuevamente.');
      sendBtn.disabled = false;
      sendBtn.textContent = 'Enviar código';
    }
  };
}

function goToStep1() {
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

// Solo permitir números
document.getElementById('cedula').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

document.getElementById('codigoEmail').addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, '');
});
