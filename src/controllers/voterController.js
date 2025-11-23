const Usuario = require('../models/Usuario');

exports.authStep1 = async (req, res) => {
  const { cedula, codigoDactilar } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { cedula } });
    if(!usuario) {
        return res.status(404).json({
            success: false,
            message: 'Votante no encontrado.'
        });
    }

    if(usuario.CodigoDactilar !== codigoDactilar) {
        return res.status(401).json({
            success: false,
            message: 'Código dactilar incorrecto.'
        });
    }

    if(usuario.HaVotado) {
        return res.status(403).json({
            success: false,
            message: 'El votante ya ha ejercido su voto.'
        });
    }

    res.status(200).json({
      success: true,
      message: 'Cédula válida'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor.',
      error: err.message
    });
  }
};
