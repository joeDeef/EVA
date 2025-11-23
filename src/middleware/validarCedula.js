// middleware/validarCedula.js
const validarCedulaUtil = require('../utils/validarCedula');

function validarCedula(req, res, next) {
  const { cedula } = req.body;

  if (!cedula) {
    console.log('Cédula no proporcionada');
    return res.status(400).json(
      {success:false,
      message: "La cédula es obligatoria." });
  }

  const esValida = validarCedulaUtil(cedula);

  if (!esValida) {
        console.log('Cédula inválida:', cedula);
    return res.status(400).json({ 
      success: false,
      message: "La cédula es inválida." });
  }

  next();
}

module.exports = validarCedula;
