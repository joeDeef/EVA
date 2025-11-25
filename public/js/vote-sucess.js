// Vote Success Logic

// Prevent back navigation
window.history.pushState(null, '', window.location.href);
window.onpopstate = () => {
  window.history.pushState(null, '', window.location.href);
};

// Display vote time and folio
const now = new Date();

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('vote-date').textContent = now.toLocaleDateString('es-ES', dateOptions);

const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
document.getElementById('vote-time').textContent = now.toLocaleTimeString('es-ES', timeOptions);

// Generate random folio
const folio = Math.random().toString(36).substr(2, 9).toUpperCase();
document.getElementById('vote-folio').textContent = folio;

// Clear session
sessionStorage.removeItem('voter-token');
sessionStorage.removeItem('selected-candidate');
