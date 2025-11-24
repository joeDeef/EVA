// middleware/validarCedula.js
const validarCedulaUtil = require('../utils/validarCedula');

function validarCedula(req, res, next) {
  const { cedula } = req.body;

  if (!cedula) {
    return res.status(400).json(
      {success:false,
      message: "La cédula es obligatoria." });
  }

  const esValida = validarCedulaUtil(cedula);

  if (!esValida) {
    return res.status(400).json({ 
      success: false,
      message: "La cédula es inválida." });
  }

  next();
}

module.exports = validarCedula;
