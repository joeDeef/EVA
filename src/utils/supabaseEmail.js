const { createClient } = require("@supabase/supabase-js");

const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;

const supabase = createClient(SUPABASE_KEY, SUPABASE_URL);

async function sendOtp(emailUsuario) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: emailUsuario,
    options: {
      // set this to false if you do not want the user to be automatically signed up
      shouldCreateUser: false,
    },
  });

  if (error) {
    return { status: false, message: `Error enviando OTP:${error.message}` };
  } else {
    return { status: true, message: "OTP enviado correctamente" };
  }
}

async function verifyOtp(codigoUsuario, emailUsuario) {
  const { data: verifyData, error: verifyError } =
    await supabase.auth.verifyOtp({
      email: emailUsuario,
      token: codigoUsuario,
      type: "email",
    });

  if (verifyError) {
    console.error("Código incorrecto!", verifyError);
    return false;
  }
  return true;
}

module.exports = {
  sendOtp,
  verifyOtp,
};
