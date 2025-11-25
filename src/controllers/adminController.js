const {
  Administrador,
  AdminCredencial,
  Usuario,
  Voto,
  Eleccion,
  Candidato,
} = require("../models");
const bcrypt = require("bcrypt");
const { Sequelize } = require("sequelize");
const PasswordUtils = require("../utils/passwordUtils");

const path = require("path"); // Importante importar path

const adminController = {
  viewLogin: (req, res) => {
    console.log("Rendering admin login view");
    // Corrección: Apuntar a public/views
    const viewPath = path.join(
      __dirname,
      "../../public/views",
      "admin-login.html"
    );
    res.sendFile(viewPath);
  },

  viewDashboard: (req, res) => {
    // Corrección: Apuntar a public/views
    const viewPath = path.join(
      __dirname,
      "../../public/views",
      "admin-dashboard.html"
    );
    res.sendFile(viewPath);
  },

  login: async (req, res) => {
    try {
      const { correo, password } = req.body;

      // Buscar administrador
      const admin = await Administrador.findOne({ where: { Correo: correo } });
      if (!admin)
        return res.status(401).json({ message: "Usuario no encontrado" });

      // Buscar credenciales
      const creds = await AdminCredencial.findOne({
        where: { AdminID: admin.AdminID },
      });

      if (!creds)
        return res.status(401).json({ message: "Credenciales no encontradas" });

      // Verificar contraseña usando bcrypt con utilidades
      const match = await PasswordUtils.verifyPassword(password, creds.HashPassword);

      if (!match)
        return res.status(401).json({ message: "Contraseña incorrecta" });

      // Respuesta exitosa
      return res.json({
        message: "Login exitoso",
        admin: { id: admin.AdminID, nombre: admin.Nombres },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },

  // =========================================================
  // 3. OBTENER DATOS DASHBOARD
  // =========================================================
  getDashboardStats: async (req, res) => {
    try {
      const totalVotantes = await Usuario.count();
      const votantesParticipantes = await Usuario.count({
        where: { HaVotado: true },
      });
      const porcentaje =
        totalVotantes > 0
          ? ((votantesParticipantes / totalVotantes) * 100).toFixed(2)
          : 0;
      const eleccionesActivas = await Eleccion.count({
        where: { Estado: "Activa" },
      });

      res.json({
        totalVotantes,
        votosEmitidos: votantesParticipantes,
        participacion: porcentaje,
        eleccionesActivas,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // =========================================================
  // 4. CREAR ELECCIÓN
  // =========================================================
  createElection: async (req, res) => {
    try {
      const { nombre, fechaInicio, fechaFin, tipo, candidatos } = req.body;

      const nuevaEleccion = await Eleccion.create({
        Nombre: nombre,
        FechaInicio: fechaInicio,
        FechaFin: fechaFin,
        Estado: "Activa",
      });

      // Validar que candidatos sea string antes de hacer split
      if (candidatos && typeof candidatos === "string") {
        const listaCandidatos = candidatos.split(",").map((c) => c.trim());
        for (const candNombre of listaCandidatos) {
          await Candidato.create({
            EleccionID: nuevaEleccion.EleccionID,
            Nombre: candNombre,
            Descripcion:
              tipo === "normativa"
                ? "Opción de referéndum"
                : "Candidato oficial",
          });
        }
      }

      res.json({
        message: "Elección creada exitosamente",
        id: nuevaEleccion.EleccionID,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear elección" });
    }
  },

  // =========================================================
  // 5. GESTIÓN DE ADMINS
  // =========================================================
  getAdmins: async (req, res) => {
    try {
      const admins = await Administrador.findAll({
        attributes: ["AdminID", "Nombres", "Correo", "FechaCreacion"],
      });
      res.json(admins);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createAdmin: async (req, res) => {
    try {
      const { nombres, correo, password } = req.body;

      // Validar que la contraseña tenga al menos 6 caracteres
      if (!password || password.length < 6) {
        return res.status(400).json({ 
          message: "La contraseña debe tener al menos 6 caracteres" 
        });
      }

      // Verificar si el correo ya existe
      const existingAdmin = await Administrador.findOne({ 
        where: { Correo: correo } 
      });
      
      if (existingAdmin) {
        return res.status(400).json({ 
          message: "Ya existe un administrador con este correo" 
        });
      }

      const newAdmin = await Administrador.create({
        Nombres: nombres,
        Correo: correo,
        FechaCreacion: Sequelize.literal("GETDATE()"),
      });

      // Cifrar la contraseña con bcrypt usando utilidades
      const hashedPassword = await PasswordUtils.hashPassword(password);
      
      await AdminCredencial.create({
        AdminID: newAdmin.AdminID,
        HashPassword: hashedPassword,
        FechaCreacion: Sequelize.literal("GETDATE()"),
      });

      res.json({ 
        message: "Administrador creado exitosamente",
        adminId: newAdmin.AdminID 
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      // Eliminar credenciales primero (FK constraint)
      await AdminCredencial.destroy({ where: { AdminID: id } });

      // Eliminar administrador
      const deleted = await Administrador.destroy({ where: { AdminID: id } });

      if (deleted) {
        res.json({ message: "Administrador eliminado exitosamente" });
      } else {
        res.status(404).json({ message: "Administrador no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombres, correo, password } = req.body;

      // Verificar que el administrador existe
      const existingAdmin = await Administrador.findByPk(id);
      if (!existingAdmin) {
        return res.status(404).json({ message: "Administrador no encontrado" });
      }

      // Verificar si el correo ya existe en otro administrador
      if (correo && correo !== existingAdmin.Correo) {
        const emailExists = await Administrador.findOne({
          where: { 
            Correo: correo,
            AdminID: { [Sequelize.Op.ne]: id } // Excluir el admin actual
          }
        });
        
        if (emailExists) {
          return res.status(400).json({ 
            message: "Ya existe otro administrador con este correo" 
          });
        }
      }

      // Actualizar datos del administrador
      const updateData = {};
      if (nombres) updateData.Nombres = nombres;
      if (correo) updateData.Correo = correo;
      
      const [updatedRows] = await Administrador.update(updateData, {
        where: { AdminID: id },
      });

      // Si se proporcionó nueva contraseña, validarla y cifrarla
      if (password && password.trim() !== "") {
        // Validar longitud de contraseña
        if (password.length < 6) {
          return res.status(400).json({ 
            message: "La contraseña debe tener al menos 6 caracteres" 
          });
        }

        // Cifrar la nueva contraseña usando utilidades
        const hashedPassword = await PasswordUtils.hashPassword(password);
        
        await AdminCredencial.update(
          { HashPassword: hashedPassword },
          { where: { AdminID: id } }
        );
      }

      if (updatedRows > 0 || password) {
        res.json({ message: "Administrador actualizado exitosamente" });
      } else {
        res.status(400).json({ message: "No se realizaron cambios" });
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // =========================================================
  // 6. GESTIÓN DE CIUDADANOS
  // =========================================================
  searchCitizen: async (req, res) => {
    try {
      const { cedula } = req.params;

      const citizen = await Usuario.findOne({
        where: { Cedula: cedula },
        attributes: [
          "UsuarioID",
          "Cedula",
          "Nombres",
          "Correo",
          "Activo",
          "HaVotado",
        ],
      });

      if (citizen) {
        res.json(citizen);
      } else {
        res.status(404).json({ message: "Ciudadano no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCitizen: async (req, res) => {
    try {
      const { id } = req.params;
      const { correo } = req.body;

      const [updatedRows] = await Usuario.update(
        { Correo: correo },
        { where: { UsuarioID: id } }
      );

      if (updatedRows > 0) {
        res.json({ message: "Correo actualizado exitosamente" });
      } else {
        res.status(404).json({ message: "Ciudadano no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  logout: (req, res) => {
    res.redirect("/");
  },
};

module.exports = adminController;
