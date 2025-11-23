const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Administrador = require("./Administrador");

const AdminCredencial = sequelize.define("AdminCredencial", {
  CredencialID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  AdminID: { type: DataTypes.INTEGER, allowNull: false },
  HashPassword: { type: DataTypes.STRING(255), allowNull: false },
  Salt: { type: DataTypes.STRING(255) },
  FechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "AdminCredenciales",
  timestamps: false,
});

AdminCredencial.belongsTo(Administrador, { foreignKey: "AdminID" });
Administrador.hasOne(AdminCredencial, { foreignKey: "AdminID" });

module.exports = AdminCredencial;
