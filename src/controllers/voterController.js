const Usuario = require("../models/Usuario");
const SesionTemporal = require("../models/SesionTemporal");
const { sendOtp, verifyOtp } = require("../utils/supabaseEmail");
const maskEmail = require("../utils/maskEmail");

exports.authStep1 = async (req, res) => {
  const { cedula, codigoDactilar } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { cedula } });

    if(!usuario){
      return res.json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (usuario.CodigoDactilar !== codigoDactilar) {
      return res.json({
        success: false,
        message: "Código dactilar incorrecto",
      });
    }

    if (usuario.HaVotado) {
      return res.status(403).json({
        success: false,
        message: "El votante ya ha ejercido su voto.",
      });
    }

    const token = crypto.randomUUID();
    await SesionTemporal.create({
      token,
      cedula,
      email: usuario.Correo,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
  const maskedEmail = maskEmail(usuario.Correo);

    res.status(200).json({
      success: true,
      tokenSesion: token,
      email: maskedEmail,
    });
  } catch (err) {
    console.error("Error en authStep1:", err);
    res.status(500).json({
      success: false,
      message: "Error en el servidor.",
      error: err.message,
    });
  }
};

exports.sendVoterCode = async (req, res) => {
  const { token } = req.body;

  try {
    const session = await SesionTemporal.findOne({ where: { token } });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión temporal no encontrada.",
      });
    }
    sendOtp(session.email)

    return res.status(200).json({
      success: true,
      message: "Código enviado al email del votante.",
    });
  } catch (err) {
    console.error("Error en sendVoterCode:", err);
    res.status(500).json({
      success: false,
      message: "Error en el servidor.",
      error: err.message,
    });
  }
};

exports.authStep2 = async (req, res) => {
  const { codigoEmail, token } = req.body;

  try {
    const session = await SesionTemporal.findOne({ where: { token } });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión temporal no encontrada.",
      });
    }

    if (!codigoEmail || codigoEmail.length !== 8) {
      return res.status(400).json({
        success: false,
        message: "Código de email inválido.",
      });
    }

    console.log("Verifying OTP:", codigoEmail, session.email);
    if(verifyOtp(codigoEmail, session.email)){
          return res.status(200).json({
      success: true,
      message: "Código verificado. Votante autenticado.",
    });
    }
  } catch (err) {
    console.error("Error en authStep2:", err);
    res.status(500).json({
      success: false,
      message: "Error en el servidor.",
      error: err.message,
    });
  }
};
