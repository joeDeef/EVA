function maskEmail(email) {
  try {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const local = parts[0];
    const domain = parts[1];
    const visible = local.slice(0, 4); // primeros 4 caracteres visibles
    return `${visible}${'*'.repeat(Math.max(3, local.length - 4))}@${domain}`;
  } catch (e) {
    return email;
  }
}

module.exports = maskEmail;