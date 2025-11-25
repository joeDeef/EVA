const { DataTypes } = require('sequelize');
const sequelize = require("../config/db");

const SesionTemporal = sequelize.define('SesionTemporal', {
  token: {
    type: DataTypes.STRING(200),
    primaryKey: true,
  },
  cedula: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  expiresAt: {
    type: DataTypes.BIGINT, // timestamp en ms
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'SesionTemporal',
  timestamps: false, // Manejamos createdAt y updatedAt manualmente
});

module.exports = SesionTemporal;
