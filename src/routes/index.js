const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');

// API route used for healthcheck or API landing
router.get('/api/ping', homeController.ping);

// Example API route for votes (placeholder)
router.get('/api/info', (req, res) => {
  res.json({ app: 'EVA Voting', version: '1.0.0' });
});

module.exports = router;
