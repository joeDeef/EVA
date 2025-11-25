const express = require('express');
const router = express.Router();

const validarCedula = require('../middleware/validarCedula');
const voterController = require('../controllers/voterController');
const resultsController = require('../controllers/resultsController');
const chatController = require('../controllers/chatController');

// Rutas de resultados
router.get('/results/elections', resultsController.getElections);
router.get('/results/:eleccionId', resultsController.getResults);
router.get('/results/:eleccionId/stats', resultsController.getStats);
router.get('/results/:eleccionId/leader', resultsController.getLeader);

// Rutas de votación
const adminController = require('../controllers/adminController');

// Rutas de votantes
router.post('/voter-auth-step1', validarCedula, voterController.authStep1);
router.post('/voter-send-code', voterController.sendVoterCode);
router.post('/voter-auth-step2', voterController.authStep2);
router.post('/vote', voterController.submitVote);

// Rutas de chat
router.post('/verify-user', chatController.verifyUser);
// Rutas de administración
router.get('/admin/stats', adminController.getDashboardStats);
router.get('/admin/list', adminController.getAdmins);
router.post('/admin/create', adminController.createAdmin);
router.put('/admin/update/:id', adminController.updateAdmin);
router.delete('/admin/delete/:id', adminController.deleteAdmin);
router.post('/elections/create', adminController.createElection);

// Vistas (HTML)
router.get('/admin/login', adminController.viewLogin);
router.get('/admin/dashboard', adminController.viewDashboard); // Debería tener middleware de auth

// API Endpoints (JSON)
router.post('/admin/login', adminController.login);
router.get('/admin/stats', adminController.getDashboardStats);
router.post('/admin/elections', adminController.createElection);

// Gestión de Admins
router.get('/admin/users', adminController.getAdmins);
router.post('/admin/users', adminController.createAdmin);


// Rutas de ciudadanos
router.get('/citizens/search/:cedula', adminController.searchCitizen);
router.put('/citizens/update/:id', adminController.updateCitizen);

module.exports = router;
