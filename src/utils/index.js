const { sendOtp } = require("./supabaseEmail");
const { verifyOtp } = require("./supabaseEmail");
const maskEmail = require("./maskEmail");
const { obtenerEleccionActiva } = require("./elecciónActiva");

module.exports = {
  sendOtp,
  verifyOtp,
  maskEmail,
  obtenerEleccionActiva,
};
