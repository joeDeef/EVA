const sequelize = require("../config/db");

const Usuario = require("./Usuario");
const Administrador = require("./Administrador");
const AdminCredencial = require("./AdminCredencial");
const Eleccion = require("./Eleccion");
const Candidato = require("./Candidato");
const Voto = require("./Voto");

Usuario.hasMany(Voto, { foreignKey: 'UsuarioID' });
Voto.belongsTo(Usuario, { foreignKey: 'UsuarioID' });

Eleccion.hasMany(Voto, { foreignKey: 'EleccionID' });
Voto.belongsTo(Eleccion, { foreignKey: 'EleccionID' });

Eleccion.hasMany(Candidato, { foreignKey: 'EleccionID' });
Candidato.belongsTo(Eleccion, { foreignKey: 'EleccionID' });

Administrador.hasOne(AdminCredencial, { foreignKey: 'AdminID' });
AdminCredencial.belongsTo(Administrador, { foreignKey: 'AdminID' });


module.exports = {
  sequelize,
  Usuario,
  Administrador,
  AdminCredencial,
  Eleccion,
  Candidato,
  Voto
};