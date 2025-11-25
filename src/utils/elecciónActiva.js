const Eleccion = require("../models/Eleccion");
const { Op, Sequelize } = require("sequelize");

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

module.exports = { obtenerEleccionActiva };