// Very small auth middleware placeholder
module.exports = function (req, res, next) {
  // Example: allow all requests for now. To restrict, check headers or session.
  // if (!req.headers['x-api-key']) return res.status(401).json({ error: 'No API key' });
  next();
};
