const Candidato = require("../models/Candidato");
const { obtenerEleccionActiva } = require("../utils/elecciónActiva");

exports.getCandidatos = async () => {
  const eleccion = await obtenerEleccionActiva();

  if (!eleccion) return [];

  const candidatos = await Candidato.findAll({
    where: { EleccionID: eleccion.EleccionID },
    attributes: ["CandidatoID", "Nombre", "Descripcion"]
  });

  const lista = candidatos.map(c => ({
    id: c.CandidatoID,
    nombre: c.Nombre,
    descripcion: c.Descripcion,
    votos: 0
  }));

  return lista;
};
