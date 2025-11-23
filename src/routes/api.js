const express = require('express');
const router = express.Router();
const path = require('path');

const validarCedula = require('../middleware/validarCedula');
const voterController = require('../controllers/voterController');

router.post('/voter-auth-step1', validarCedula, voterController.authStep1);


module.exports = router;
