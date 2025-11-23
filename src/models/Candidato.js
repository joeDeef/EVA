const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Eleccion = require("./Eleccion");

const Candidato = sequelize.define("Candidato", {
  CandidatoID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  EleccionID: { type: DataTypes.INTEGER, allowNull: false },
  Nombre: { type: DataTypes.STRING(150), allowNull: false },
  Descripcion: { type: DataTypes.STRING(300) },
  Activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  FechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "Candidatos",
  timestamps: false,
});

Candidato.belongsTo(Eleccion, { foreignKey: "EleccionID" });
Eleccion.hasMany(Candidato, { foreignKey: "EleccionID" });

module.exports = Candidato;
