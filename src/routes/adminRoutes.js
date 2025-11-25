const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Vistas (HTML)
router.get('/login', adminController.viewLogin);
router.get('/dashboard', adminController.viewDashboard); // Debería tener middleware de auth

// API Endpoints (JSON)
router.post('/login', adminController.login);
router.get('/stats', adminController.getDashboardStats);
router.post('/elections', adminController.createElection);

// Gestión de Admins
router.get('/users', adminController.getAdmins);
router.post('/users', adminController.createAdmin);

//REcuperar contrasela
router.get('/password-recovery', adminController.viewForgotPassword);

module.exports = router;