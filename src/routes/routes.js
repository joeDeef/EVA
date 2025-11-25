const express = require('express');
const router = express.Router();

const adminRoutes = require('./adminRoutes');
const appRoutes = require('./app');
const apiRoutes = require('./api');

router.use('/', appRoutes);
router.use('/api', apiRoutes);
router.use('/admin', adminRoutes);
router.use('/api/admin', adminRoutes);

module.exports = router;
