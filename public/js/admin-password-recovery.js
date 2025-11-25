// ===============================================
//      ADMIN PASSWORD RECOVERY LOGIC
// ===============================================

class PasswordRecovery {
  constructor() {
    this.currentStep = 1;
    this.maxAttempts = 3;
    this.attemptCount = 0;
    this.timeLeft = 600; // 10 minutes
    this.countdownInterval = null;
    this.adminEmail = '';
    this.resetToken = '';
    
    this.initializeElements();
    this.bindEvents();
    this.updateStepDisplay();
  }

  initializeElements() {
    // Step elements
    this.stepTitle = document.getElementById('step-title');
    this.stepSubtitle = document.getElementById('step-subtitle');
    this.stepContents = document.querySelectorAll('.step-content');
    this.progressSteps = document.querySelectorAll('.step');

    // Alert elements
    this.errorAlert = document.getElementById('error-alert');
    this.successAlert = document.getElementById('success-alert');
    this.infoAlert = document.getElementById('info-alert');
    this.errorMessage = document.getElementById('error-message');
    this.successMessage = document.getElementById('success-message');
    this.infoMessage = document.getElementById('info-message');

    // Form elements
    this.emailForm = document.getElementById('email-form');
    this.codeForm = document.getElementById('code-form');
    this.passwordForm = document.getElementById('password-form');
    
    this.emailInput = document.getElementById('email');
    this.codeInput = document.getElementById('code');
    this.newPasswordInput = document.getElementById('new-password');
    this.confirmPasswordInput = document.getElementById('confirm-password');
    
    this.maskedEmailDisplay = document.getElementById('masked-email');
    this.countdownDisplay = document.getElementById('countdown');
    this.resendBtn = document.getElementById('resend-btn');

    // Password strength elements
    this.strengthFill = document.getElementById('strength-fill');
    this.strengthText = document.getElementById('strength-text');
  }

  bindEvents() {
    // Form submissions
    this.emailForm.addEventListener('submit', (e) => this.handleEmailSubmit(e));
    this.codeForm.addEventListener('submit', (e) => this.handleCodeSubmit(e));
    this.passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));

    // Resend button
    this.resendBtn.addEventListener('click', () => this.handleResendCode());

    // Input events
    this.emailInput.addEventListener('input', () => this.hideAlerts());
    this.codeInput.addEventListener('input', (e) => {
      this.hideAlerts();
      this.formatCodeInput(e);
    });
    this.newPasswordInput.addEventListener('input', () => {
      this.hideAlerts();
      this.checkPasswordStrength();
    });
    this.confirmPasswordInput.addEventListener('input', () => this.hideAlerts());
  }

  // ===============================================
  //      STEP MANAGEMENT
  // ===============================================

  updateStepDisplay() {
    // Update step content visibility
    this.stepContents.forEach((content, index) => {
      content.classList.toggle('hidden', index + 1 !== this.currentStep);
    });

    // Update progress steps
    this.progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.toggle('active', stepNumber === this.currentStep);
      step.classList.toggle('completed', stepNumber < this.currentStep);
    });

    // Update titles and icons
    this.updateStepTitles();
  }

  updateStepTitles() {
    const stepConfig = {
      1: {
        title: 'Recuperar Contraseña',
        subtitle: 'Ingrese su correo electrónico para comenzar',
        icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
      },
      2: {
        title: 'Verificar Código',
        subtitle: 'Ingrese el código enviado a su correo',
        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      },
      3: {
        title: 'Nueva Contraseña',
        subtitle: 'Establezca su nueva contraseña segura',
        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
      }
    };

    const config = stepConfig[this.currentStep];
    this.stepTitle.textContent = config.title;
    this.stepSubtitle.textContent = config.subtitle;
    
    // Update icon
    const iconElement = document.querySelector('.recovery-icon svg path');
    if (iconElement) {
      iconElement.setAttribute('d', config.icon);
    }
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateStepDisplay();
      this.hideAlerts();
    }
  }

  // ===============================================
  //      FORM HANDLERS
  // ===============================================

  async handleEmailSubmit(e) {
    e.preventDefault();
    
    const email = this.emailInput.value.trim();
    if (!this.validateEmail(email)) return;

    const submitBtn = this.emailForm.querySelector('button[type="submit"]');
    this.setLoadingState(submitBtn, true, 'Enviando código...');

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.adminEmail = email;
        this.maskedEmailDisplay.textContent = this.maskEmail(email);
        this.showSuccess('Código enviado exitosamente. Revise su correo.');
        this.startCountdown();
        
        setTimeout(() => {
          this.nextStep();
        }, 1500);
      } else {
        this.showError(data.message || 'No se pudo enviar el código. Verifique que el correo esté registrado.');
      }
    } catch (error) {
      this.showError('Error de conexión. Verifique su conexión a internet.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async handleCodeSubmit(e) {
    e.preventDefault();
    
    if (this.attemptCount >= this.maxAttempts) {
      this.showError('Ha excedido el número máximo de intentos. Solicite un nuevo código.');
      return;
    }
    
    const code = this.codeInput.value.trim();
    if (!this.validateCode(code)) return;

    const submitBtn = this.codeForm.querySelector('button[type="submit"]');
    this.setLoadingState(submitBtn, true, 'Verificando...');

    try {
      const response = await fetch('/api/admin/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: this.adminEmail, 
          code 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.resetToken = data.resetToken;
        this.showSuccess('Código verificado correctamente.');
        this.stopCountdown();
        
        setTimeout(() => {
          this.nextStep();
        }, 1500);
      } else {
        this.attemptCount++;
        const remainingAttempts = this.maxAttempts - this.attemptCount;
        
        if (remainingAttempts > 0) {
          this.showError(`${data.message || 'Código incorrecto'}. Le quedan ${remainingAttempts} intentos.`);
        } else {
          this.showError('Ha excedido el número máximo de intentos. Solicite un nuevo código.');
          submitBtn.disabled = true;
        }
      }
    } catch (error) {
      this.showError('Error de conexión. Verifique su conexión a internet.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async handlePasswordSubmit(e) {
    e.preventDefault();
    
    const newPassword = this.newPasswordInput.value;
    const confirmPassword = this.confirmPasswordInput.value;
    
    if (!this.validatePasswords(newPassword, confirmPassword)) return;

    const submitBtn = this.passwordForm.querySelector('button[type="submit"]');
    this.setLoadingState(submitBtn, true, 'Actualizando contraseña...');

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: this.adminEmail,
          resetToken: this.resetToken,
          newPassword 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.showSuccess('Contraseña actualizada exitosamente. Redirigiendo al login...');
        
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 2000);
      } else {
        this.showError(data.message || 'Error al actualizar la contraseña. Intente nuevamente.');
      }
    } catch (error) {
      this.showError('Error de conexión. Verifique su conexión a internet.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  async handleResendCode() {
    const resendBtn = this.resendBtn;
    this.setLoadingState(resendBtn, true, 'Reenviando...');

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: this.adminEmail })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.attemptCount = 0; // Reset attempt count
        this.timeLeft = 600; // Reset timer
        this.startCountdown();
        this.showSuccess('Nuevo código enviado. Revise su correo electrónico.');
        
        // Re-enable verify button
        const verifyBtn = this.codeForm.querySelector('button[type="submit"]');
        verifyBtn.disabled = false;
      } else {
        this.showError(data.message || 'No se pudo reenviar el código.');
      }
    } catch (error) {
      this.showError('Error de conexión.');
    } finally {
      this.setLoadingState(resendBtn, false);
    }
  }

  // ===============================================
  //      VALIDATION METHODS
  // ===============================================

  validateEmail(email) {
    if (!email) {
      this.showError('Por favor ingrese su correo electrónico');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      this.showError('Por favor ingrese un correo electrónico válido');
      return false;
    }

    return true;
  }

  validateCode(code) {
    if (!code) {
      this.showError('Por favor ingrese el código de verificación');
      return false;
    }

    if (code.length !== 8) {
      this.showError('El código debe tener exactamente 8 dígitos');
      return false;
    }

    if (!/^\d{8}$/.test(code)) {
      this.showError('El código debe contener solo números');
      return false;
    }

    return true;
  }

  validatePasswords(newPassword, confirmPassword) {
    if (!newPassword) {
      this.showError('Por favor ingrese una nueva contraseña');
      return false;
    }

    if (newPassword.length < 8) {
      this.showError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      this.showError('La contraseña debe incluir mayúsculas, minúsculas y números');
      return false;
    }

    if (newPassword !== confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  }

  // ===============================================
  //      UTILITY METHODS
  // ===============================================

  maskEmail(email) {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length <= 3 
      ? localPart[0] + '*'.repeat(Math.max(1, localPart.length - 1))
      : localPart.slice(0, 2) + '*'.repeat(Math.max(1, localPart.length - 4)) + localPart.slice(-2);
    return maskedLocal + '@' + domain;
  }

  formatCodeInput(e) {
    // Only allow numbers
    e.target.value = e.target.value.replace(/\D/g, '');
  }

  checkPasswordStrength() {
    const password = this.newPasswordInput.value;
    const strength = this.calculatePasswordStrength(password);
    
    this.strengthFill.className = `strength-fill ${strength.level}`;
    this.strengthText.textContent = strength.text;
    this.strengthText.className = strength.level;
  }

  calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', text: 'Contraseña débil' };
    if (score <= 4) return { level: 'fair', text: 'Contraseña regular' };
    if (score <= 5) return { level: 'good', text: 'Contraseña buena' };
    return { level: 'strong', text: 'Contraseña muy segura' };
  }

  startCountdown() {
    this.updateCountdownDisplay();
    this.countdownInterval = setInterval(() => {
      this.timeLeft--;
      this.updateCountdownDisplay();
      
      if (this.timeLeft <= 0) {
        this.stopCountdown();
        this.showError('El código ha expirado. Solicite un nuevo código.');
        const verifyBtn = this.codeForm.querySelector('button[type="submit"]');
        verifyBtn.disabled = true;
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  updateCountdownDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.countdownDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  setLoadingState(button, loading, text = '') {
    if (loading) {
      button.disabled = true;
      button.classList.add('loading');
      if (text) {
        button.dataset.originalText = button.textContent;
        button.textContent = text;
      }
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
    }
  }

  // ===============================================
  //      ALERT METHODS
  // ===============================================

  hideAlerts() {
    this.errorAlert.classList.add('hidden');
    this.successAlert.classList.add('hidden');
    this.infoAlert.classList.add('hidden');
  }

  showError(message) {
    this.hideAlerts();
    this.errorMessage.textContent = message;
    this.errorAlert.classList.remove('hidden');
    this.scrollToAlert();
    
    setTimeout(() => {
      this.errorAlert.classList.add('hidden');
    }, 5000);
  }

  showSuccess(message) {
    this.hideAlerts();
    this.successMessage.textContent = message;
    this.successAlert.classList.remove('hidden');
    this.scrollToAlert();
  }

  showInfo(message) {
    this.hideAlerts();
    this.infoMessage.textContent = message;
    this.infoAlert.classList.remove('hidden');
    this.scrollToAlert();
  }

  scrollToAlert() {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Initialize the password recovery system
document.addEventListener('DOMContentLoaded', () => {
  new PasswordRecovery();
});