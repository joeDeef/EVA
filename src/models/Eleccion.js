const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Eleccion = sequelize.define("Eleccion", {
  EleccionID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Nombre: { type: DataTypes.STRING(200), allowNull: false },
  FechaInicio: { type: DataTypes.DATE, allowNull: false },
  FechaFin: { type: DataTypes.DATE, allowNull: false },
  Estado: { type: DataTypes.STRING(20), defaultValue: "Activa" },
  FechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "Elecciones",
  timestamps: false,
});

module.exports = Eleccion;
