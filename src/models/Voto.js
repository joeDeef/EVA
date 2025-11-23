const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Usuario = require("./Usuario");
const Eleccion = require("./Eleccion");
const Candidato = require("./Candidato");

const Voto = sequelize.define("Voto", {
  VotoID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  UsuarioID: { type: DataTypes.INTEGER, allowNull: false },
  EleccionID: { type: DataTypes.INTEGER, allowNull: false },
  CandidatoID: { type: DataTypes.INTEGER, allowNull: false },
  Provincia: { type: DataTypes.STRING(100), allowNull: false },
  FechaVoto: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "Votos",
  timestamps: false,
  indexes: [{ unique: true, fields: ["UsuarioID", "EleccionID"] }]
});

Voto.belongsTo(Usuario, { foreignKey: "UsuarioID" });
Usuario.hasMany(Voto, { foreignKey: "UsuarioID" });

Voto.belongsTo(Eleccion, { foreignKey: "EleccionID" });
Eleccion.hasMany(Voto, { foreignKey: "EleccionID" });

Voto.belongsTo(Candidato, { foreignKey: "CandidatoID" });
Candidato.hasMany(Voto, { foreignKey: "CandidatoID" });

module.exports = Voto;
