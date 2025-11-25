const express = require('express');
const path = require('path');
const fs = require('fs');
const sequelize = require('./src/config/db');

//Usado para las variables de entorno
try {
  require('dotenv').config();
} catch (e) {}

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Servir index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','views', 'index.html'));
});

// Si existe un router en src/routes/index.js lo montamos
const routesPath = path.join(__dirname, 'src', 'routes', 'routes.js');
if (fs.existsSync(routesPath)) {
  try {
    const indexRouter = require(routesPath);
    app.use('/', indexRouter);
  } catch (err) {
    console.warn('No se pudo montar src/routes/routes.js:', err);
  }
}

// 404: enviar 404.html si existe
app.use((req, res) => {
  const notFound = path.join(__dirname, 'public', 'views', '404.html');
  if (fs.existsSync(notFound)) return res.status(404).sendFile(notFound);
  return res.status(404).send('Página no encontrada');
});

// **Levantar servidor**
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa.');

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

startServer();