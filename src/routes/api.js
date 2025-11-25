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
router.post('/voter-auth-step1', validarCedula, voterController.authStep1);
router.post('/voter-send-code', voterController.sendVoterCode);
router.post('/voter-auth-step2', voterController.authStep2);
router.post('/vote', voterController.submitVote);

// Rutas de chat
router.post('/verify-user', chatController.verifyUser);

module.exports = router;
