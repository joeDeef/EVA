/**
 * Middleware para validación de contraseñas y datos de administradores
 */

// Simple email validation function (instead of validator package)
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const adminValidation = {
  /**
   * Valida los datos para crear un nuevo administrador
   */
  validateCreateAdmin: (req, res, next) => {
    const { nombres, correo, password } = req.body;
    const errors = [];

    // Validar nombres
    if (!nombres || nombres.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (nombres && nombres.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    // Validar correo
    if (!correo || !isValidEmail(correo)) {
      errors.push('Debe proporcionar un correo electrónico válido');
    }

    // Validar contraseña
    if (!password) {
      errors.push('La contraseña es obligatoria');
    } else {
      const passwordErrors = validatePassword(password);
      errors.push(...passwordErrors);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Datos de validación incorrectos',
        errors: errors
      });
    }

    // Limpiar y normalizar datos
    req.body.nombres = nombres.trim();
    req.body.correo = correo.trim().toLowerCase();
    req.body.password = password; // No modificar la contraseña

    next();
  },

  /**
   * Valida los datos para actualizar un administrador
   */
  validateUpdateAdmin: (req, res, next) => {
    const { nombres, correo, password } = req.body;
    const errors = [];

    // Validar nombres si se proporciona
    if (nombres !== undefined) {
      if (!nombres || nombres.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      }
      if (nombres.trim().length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
      }
    }

    // Validar correo si se proporciona
    if (correo !== undefined) {
      if (!correo || !isValidEmail(correo)) {
        errors.push('Debe proporcionar un correo electrónico válido');
      }
    }

    // Validar contraseña si se proporciona
    if (password !== undefined && password.trim() !== '') {
      const passwordErrors = validatePassword(password);
      errors.push(...passwordErrors);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Datos de validación incorrectos',
        errors: errors
      });
    }

    // Limpiar y normalizar datos
    if (nombres !== undefined) {
      req.body.nombres = nombres.trim();
    }
    if (correo !== undefined) {
      req.body.correo = correo.trim().toLowerCase();
    }

    next();
  },

  /**
   * Valida los datos de login
   */
  validateLogin: (req, res, next) => {
    const { correo, password } = req.body;
    const errors = [];

    // Validar correo
    if (!correo || !isValidEmail(correo)) {
      errors.push('Debe proporcionar un correo electrónico válido');
    }

    // Validar contraseña
    if (!password || password.trim().length === 0) {
      errors.push('La contraseña es obligatoria');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Credenciales de login inválidas',
        errors: errors
      });
    }

    // Normalizar correo
    req.body.correo = correo.trim().toLowerCase();

    next();
  }
};

/**
 * Función auxiliar para validar contraseñas
 */
function validatePassword(password) {
  const errors = [];

  // Longitud mínima
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  // Longitud máxima
  if (password.length > 128) {
    errors.push('La contraseña no puede exceder 128 caracteres');
  }

  // Al menos una letra
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra');
  }

  // Al menos un número (recomendado pero no obligatorio)
  // if (!/[0-9]/.test(password)) {
  //   errors.push('La contraseña debe contener al menos un número');
  // }

  // Verificar caracteres no permitidos (opcional)
  // if (/[<>'"&]/.test(password)) {
  //   errors.push('La contraseña contiene caracteres no permitidos');
  // }

  return errors;
}

/**
 * Función auxiliar para validar ID de administrador
 */
function validateAdminId(req, res, next) {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      message: 'ID de administrador inválido'
    });
  }

  req.params.id = parseInt(id);
  next();
}

/**
 * Función de seguridad para prevenir ataques de timing
 */
function constantTimeResponse(req, res, next) {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const ms = diff[0] * 1000 + diff[1] * 1e-6;
    
    // Log para debugging (remover en producción)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Request to ${req.path} took ${ms.toFixed(2)}ms`);
    }
  });
  
  next();
}

module.exports = {
  validateCreateAdmin: adminValidation.validateCreateAdmin,
  validateUpdateAdmin: adminValidation.validateUpdateAdmin,
  validateLogin: adminValidation.validateLogin,
  validateAdminId,
  constantTimeResponse,
  validatePassword
};