// Minimal in-memory user service for bootstrapping
const users = [
  { id: 1, name: 'Maria Voter', email: 'maria@example.com' }
];

module.exports = {
  findAll() { return users; },
  findById(id) { return users.find(u => u.id === Number(id)) || null; }
};
