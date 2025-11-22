exports.ping = (req, res) => {
  res.json({ status: 'ok', message: 'pong', time: new Date().toISOString() });
};

exports.index = (req, res) => {
  res.json({ app: 'EVA Voting API', message: 'Welcome' });
};
