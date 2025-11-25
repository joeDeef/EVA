// Module loader for legacy compatibility
// This file helps with module loading in development environments

// Check if browser supports modules
if (!('noModule' in HTMLScriptElement.prototype)) {
  console.warn('ES6 modules not supported, falling back to legacy scripts');
}

// Polyfill for browsers that don't support import/export
if (typeof exports === 'undefined') {
  window.exports = {};
}
if (typeof module === 'undefined') {
  window.module = { exports: {} };
}