const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Administrador = sequelize.define("Administrador", {
  AdminID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Nombres: { type: DataTypes.STRING(120), allowNull: false },
  Correo: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  Activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  FechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "Administradores",
  timestamps: false,
});

module.exports = Administrador;
