const { Sequelize } = require("sequelize");

//Usado para las variables de entorno
try {
  require('dotenv').config();
} catch (e) {}

//Variables para la conexión
const DatabaseName = process.env.DB_NAME;
const DatabaseUser = process.env.DB_USER;
const DatabasePassword = process.env.DB_PASSWORD;

// Conexión a SQL Server
const sequelize = new Sequelize(
  DatabaseName,
  DatabaseUser,
  DatabasePassword,
  {
    host: "localhost",          // Dirección del servidor de base de datos
    port: 1433,                // Puerto por defecto de SQL Server es 14333 (Docker)
    dialect: "mssql",           // Usando SQL Server
    dialectOptions: {
      options: {
        encrypt: false,         // cambiar a true si usas conexión segura
      },
    },
    logging: false,             // Desactivar logging de SQL
  }
);

module.exports = sequelize;
