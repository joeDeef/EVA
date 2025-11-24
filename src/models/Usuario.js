const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Usuario = sequelize.define("Usuario", {
  UsuarioID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Cedula: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  CodigoDactilar: { type: DataTypes.STRING(20), allowNull: false },
  Correo: { type: DataTypes.STRING(120), allowNull: false },
  Nombres: { type: DataTypes.STRING(120), allowNull: false },
  Provincia: { type: DataTypes.STRING(100), allowNull: false },
  HaVotado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  FechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  Activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "Usuarios",
  timestamps: false,
});

module.exports = Usuario;
