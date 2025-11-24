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
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Servir index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','views', 'index.html'));
});

// Si existe un router en src/routes/index.js lo montamos
const routesPath = path.join(__dirname, 'src', 'routes', 'index.js');
if (fs.existsSync(routesPath)) {
  try {
    const indexRouter = require(routesPath);
    app.use('/', indexRouter);
  } catch (err) {
    console.warn('No se pudo montar src/routes/index.js:', err.message);
  }
}

// 404: enviar 404.html si existe, si no, mensaje simple
app.use((req, res) => {
  const notFound = path.join(__dirname, 'public', '404.html');
  if (fs.existsSync(notFound)) return res.status(404).sendFile(notFound);
  return res.status(404).send('Página no encontrada');
});

// **Prueba de conexión y levantar servidor**
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa.');
    // await sequelize.sync(); 

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

startServer();