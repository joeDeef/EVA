const { Administrador, AdminCredencial, Usuario, Voto, Eleccion, Candidato } = require('../models');
const bcrypt = require('bcrypt'); 
const path = require('path'); // Importante importar path

const adminController = {
    // =========================================================
    // 1. RENDERIZAR VISTAS (CORREGIDO)
    // =========================================================
    viewLogin: (req, res) => {
        // Corrección: Apuntar a public/views
        const viewPath = path.join(__dirname, '../../public/views', 'admin-login.html');
        res.sendFile(viewPath);
    },

    viewDashboard: (req, res) => {
        // Corrección: Apuntar a public/views
        const viewPath = path.join(__dirname, '../../public/views', 'admin-dashboard.html');
        res.sendFile(viewPath);
    },

    // =========================================================
    // 2. LÓGICA DE LOGIN
    // =========================================================
    login: async (req, res) => {
        try {
            const { correo, password } = req.body;
            
            // Buscar administrador
            const admin = await Administrador.findOne({ where: { Correo: correo } });
            if (!admin) return res.status(401).json({ message: 'Usuario no encontrado' });

            // Buscar credenciales
            const creds = await AdminCredencial.findOne({ where: { AdminID: admin.AdminID } });
            
            // NOTA IMPORTANTE: 
            // Como insertaste 'admin123' manualmente en la BD sin encriptar,
            // esta comparación simple funcionará. 
            // Cuando uses bcrypt.hash en createAdmin, deberás cambiar esto a bcrypt.compare.
            const match = (password === creds.HashPassword); 

            if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

            // Respuesta exitosa
            return res.json({ message: 'Login exitoso', admin: { id: admin.AdminID, nombre: admin.Nombres } });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },

    // =========================================================
    // 3. OBTENER DATOS DASHBOARD
    // =========================================================
    getDashboardStats: async (req, res) => {
        try {
            const totalVotantes = await Usuario.count();
            const votantesParticipantes = await Usuario.count({ where: { HaVotado: true } });
            const porcentaje = totalVotantes > 0 ? ((votantesParticipantes / totalVotantes) * 100).toFixed(2) : 0;
            const eleccionesActivas = await Eleccion.count({ where: { Estado: 'Activa' } });

            res.json({
                totalVotantes,
                votosEmitidos: votantesParticipantes,
                participacion: porcentaje,
                eleccionesActivas
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
                Estado: 'Activa'
            });

            // Validar que candidatos sea string antes de hacer split
            if (candidatos && typeof candidatos === 'string') {
                const listaCandidatos = candidatos.split(',').map(c => c.trim());
                for (const candNombre of listaCandidatos) {
                    await Candidato.create({
                        EleccionID: nuevaEleccion.EleccionID,
                        Nombre: candNombre,
                        Descripcion: tipo === 'normativa' ? 'Opción de referéndum' : 'Candidato oficial'
                    });
                }
            }

            res.json({ message: 'Elección creada exitosamente', id: nuevaEleccion.EleccionID });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear elección' });
        }
    },

    // =========================================================
    // 5. GESTIÓN DE ADMINS
    // =========================================================
    getAdmins: async (req, res) => {
        const admins = await Administrador.findAll();
        res.json(admins);
    },

    createAdmin: async (req, res) => {
        try {
            const { nombres, correo, password } = req.body;
            const newAdmin = await Administrador.create({ Nombres: nombres, Correo: correo });
            
            // Aquí deberías usar bcrypt.hash(password, 10)
            await AdminCredencial.create({
                AdminID: newAdmin.AdminID,
                HashPassword: password 
            });

            res.json({ message: 'Administrador creado' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    logout: (req, res) => {
        // Si usaras sesiones de express-session:
        // req.session.destroy();
        
        // Como estamos en un ejemplo simple sin gestión de sesiones compleja,
        // simplemente redirigimos al usuario a la página de inicio.
        // En un sistema real con JWT, aquí invalidarías el token.
        
        res.redirect('/'); 
    }
};

module.exports = adminController;