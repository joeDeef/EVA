const bcrypt = require('bcrypt');

/**
 * Utilidades para manejo seguro de contraseñas
 */

class PasswordUtils {
  /**
   * Configuración de bcrypt
   */
  static SALT_ROUNDS = 12; // Mayor número = más seguro pero más lento

  /**
   * Cifra una contraseña usando bcrypt
   * @param {string} plainPassword - Contraseña en texto plano
   * @returns {Promise<string>} - Contraseña cifrada
   */
  static async hashPassword(plainPassword) {
    try {
      if (!plainPassword) {
        throw new Error('Contraseña no puede estar vacía');
      }

      const hashedPassword = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      console.error('Error cifrando contraseña:', error);
      throw new Error('Error al procesar la contraseña');
    }
  }

  /**
   * Verifica una contraseña contra su hash
   * @param {string} plainPassword - Contraseña en texto plano
   * @param {string} hashedPassword - Contraseña cifrada
   * @returns {Promise<boolean>} - true si coinciden, false si no
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      if (!plainPassword || !hashedPassword) {
        return false;
      }

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error verificando contraseña:', error);
      return false;
    }
  }

  /**
   * Verifica si una cadena es un hash de bcrypt válido
   * @param {string} hash - Cadena a verificar
   * @returns {boolean} - true si es un hash válido
   */
  static isValidHash(hash) {
    if (!hash || typeof hash !== 'string') {
      return false;
    }

    // Los hashes de bcrypt tienen el formato: $2a$12$... o $2b$12$... etc.
    const bcryptPattern = /^\$2[abxy]\$\d{1,2}\$.{53}$/;
    return bcryptPattern.test(hash);
  }

  /**
   * Genera una contraseña temporal segura
   * @param {number} length - Longitud de la contraseña (por defecto 12)
   * @returns {string} - Contraseña temporal
   */
  static generateTemporaryPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';

    // Asegurar que tenga al menos un caracter de cada tipo
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%&*';

    // Agregar al menos uno de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Completar el resto aleatoriamente
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Mezclar los caracteres
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Evalúa la fortaleza de una contraseña
   * @param {string} password - Contraseña a evaluar
   * @returns {Object} - Objeto con score y sugerencias
   */
  static evaluatePasswordStrength(password) {
    const result = {
      score: 0,
      level: 'Muy débil',
      suggestions: []
    };

    if (!password) {
      result.suggestions.push('La contraseña es obligatoria');
      return result;
    }

    // Criterios de evaluación
    const criteria = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /[0-9]/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noCommonPatterns: !/^(password|123456|qwerty|admin)/i.test(password)
    };

    // Calcular score
    Object.values(criteria).forEach(criterion => {
      if (criterion) result.score += 1;
    });

    // Bonus por longitud extra
    if (password.length >= 12) result.score += 1;
    if (password.length >= 16) result.score += 1;

    // Determinar nivel
    if (result.score >= 7) {
      result.level = 'Muy fuerte';
    } else if (result.score >= 5) {
      result.level = 'Fuerte';
    } else if (result.score >= 3) {
      result.level = 'Moderada';
    } else if (result.score >= 1) {
      result.level = 'Débil';
    }

    // Generar sugerencias
    if (!criteria.length) {
      result.suggestions.push('Use al menos 8 caracteres');
    }
    if (!criteria.lowercase) {
      result.suggestions.push('Incluya letras minúsculas');
    }
    if (!criteria.uppercase) {
      result.suggestions.push('Incluya letras mayúsculas');
    }
    if (!criteria.numbers) {
      result.suggestions.push('Incluya números');
    }
    if (!criteria.symbols) {
      result.suggestions.push('Incluya símbolos (!@#$...)');
    }
    if (!criteria.noCommonPatterns) {
      result.suggestions.push('Evite patrones comunes');
    }

    return result;
  }

  /**
   * Limpia la memoria de variables que contienen contraseñas
   * @param {string} password - Contraseña a limpiar de memoria
   */
  static clearPasswordFromMemory(password) {
    if (typeof password === 'string') {
      // En JavaScript no podemos realmente limpiar la memoria
      // pero podemos sobrescribir la variable
      password = null;
    }
  }

  /**
   * Genera un salt personalizado (opcional, bcrypt ya genera su salt)
   * @returns {Promise<string>} - Salt generado
   */
  static async generateSalt() {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      return salt;
    } catch (error) {
      console.error('Error generando salt:', error);
      throw new Error('Error generando salt');
    }
  }
}

module.exports = PasswordUtils;