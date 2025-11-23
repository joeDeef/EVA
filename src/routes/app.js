const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/voter-login', (req, res) => {
  res.sendFile(path.join(__dirname, '..','..','public','views', 'voter-login.html'));
});


module.exports = router;
