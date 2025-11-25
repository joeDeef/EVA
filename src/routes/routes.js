const express = require('express');
const router = express.Router();

const appRoutes = require('./app');
const apiRoutes = require('./api');

router.use('/', appRoutes);
router.use('/api', apiRoutes);

module.exports = router;
