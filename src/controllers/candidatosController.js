const Candidato = require("../models/Candidato");
const Eleccion = require("../models/Eleccion");
const { Op, Sequelize } = require("sequelize");

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

async function obtenerEleccionActiva() {
  const eleccion = await Eleccion.findOne({
    where: {
      Estado: "Activa",
      FechaInicio: { [Op.lte]: Sequelize.literal("GETDATE()") },
      FechaFin: { [Op.gte]: Sequelize.literal("GETDATE()") }
    },
    order: [["EleccionID", "ASC"]]
  });

  return eleccion;
}