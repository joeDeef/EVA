const { Usuario } = require('../models');

/**
 * Verifica si una cédula está registrada y activa en el sistema
 */
async function verifyUser(req, res) {
  try {
    const { cedula } = req.body;
    
    if (!cedula) {
      return res.status(400).json({ message: 'La cédula es requerida' });
    }
    
    const usuario = await Usuario.findOne({ where: { Cedula: cedula } });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Cédula no registrada en el sistema' });
    }
    
    if (!usuario.Activo) {
      return res.status(403).json({ message: 'Usuario inactivo. Contacta al administrador.' });
    }
    
    res.json({
      success: true,
      nombres: usuario.Nombres,
      cedula: usuario.Cedula
    });
    
  } catch (error) {
    console.error('Error verificando usuario:', error);
    res.status(500).json({ message: 'Error al verificar el usuario' });
  }
}

module.exports = { verifyUser };
