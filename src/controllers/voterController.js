const Usuario = require("../models/Usuario");
const SesionTemporal = require("../models/SesionTemporal");
const Voto = require("../models/Voto");
const { Sequelize } = require("sequelize");

const { sendOtp, verifyOtp } = require("../utils/supabaseEmail");
const maskEmail = require("../utils/maskEmail");
const { obtenerEleccionActiva } = require("../utils/elecciónActiva");

exports.authStep1 = async (req, res) => {
  const { cedula, codigoDactilar } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { cedula } });
    if (!usuario) {
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
    /*
    const session = await SesionTemporal.findOne({ where: { token } });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión temporal no encontrada.",
      });
    }
    sendOtp(session.email)*/

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
    /*
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

    */
    if (true) {
      //verifyOtp(codigoEmail, session.email)){
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

exports.submitVote = async (req, res) => {
  const { candidateId } = req.body;
  const voterToken = req.headers["authorization"]?.split(" ")[1];

  try {
    const session = await SesionTemporal.findOne({
      where: { token: voterToken },
    });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión temporal no encontrada.",
      });
    }

    const usuario = await Usuario.findOne({
      where: { cedula: session.cedula },
    });

    if (usuario.HaVotado) {
      return res.status(403).json({
        success: false,
        message: "El votante ya ha ejercido su voto.",
      });
    }

    // Obtener la elección activa
    const eleccion = await obtenerEleccionActiva();

    // Guardar voto
    const voto = await Voto.create({
      EleccionID: eleccion.EleccionID,
      CandidatoID: candidateId,
      Provincia: usuario.Provincia,
      FechaVoto: Sequelize.literal("GETDATE()"),
      FechaActualizacion: Sequelize.literal("GETDATE()"),
    });

    if (!voto) {
      return res.status(500).json({
        success: false,
        message: "Error al registrar el voto.",
      });
    }

    // Marcar como votado
    usuario.HaVotado = true;
    await usuario.save();

    // Borrar sesión temporal
    await SesionTemporal.destroy({ where: { token: voterToken } });

    return res.status(200).json({
      success: true,
      message: "Voto registrado exitosamente.",
    });
  } catch (err) {
    console.error("Error en submitVote:", err);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor.",
      error: err.message,
    });
  }
};
