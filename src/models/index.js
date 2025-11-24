const sequelize = require("../config/db");

const Usuario = require("./Usuario");
const Administrador = require("./Administrador");
const AdminCredencial = require("./AdminCredencial");
const Eleccion = require("./Eleccion");
const Candidato = require("./Candidato");
const Voto = require("./Voto");
const SesionTemporal = require("./SesionTemporal");

module.exports = {
  sequelize,
  Usuario,
  Administrador,
  AdminCredencial,
  Eleccion,
  Candidato,
  Voto,
  SesionTemporal
};
