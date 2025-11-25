// Main Admin Dashboard - Modular Version
import { DashboardInit } from './modules/dashboard-init.js';
import { AdminManager } from './modules/admin-manager.js';
import { ElectionManager } from './modules/election-manager.js';
import { CitizenManager } from './modules/citizen-manager.js';

// Make classes available globally for onclick handlers
window.AdminManager = AdminManager;
window.ElectionManager = ElectionManager;
window.CitizenManager = CitizenManager;

// Make functions available globally for backward compatibility
window.toggleAddAdminForm = AdminManager.toggleAddAdminForm.bind(AdminManager);
window.editAdminInline = AdminManager.editAdminInline.bind(AdminManager);
window.saveAdminInline = AdminManager.saveAdminInline.bind(AdminManager);
window.cancelEditAdmin = AdminManager.cancelEditAdmin.bind(AdminManager);
window.changeAdminPassword = AdminManager.changeAdminPassword.bind(AdminManager);
window.deleteAdmin = AdminManager.deleteAdmin.bind(AdminManager);
window.toggleCreateElectionForm = ElectionManager.toggleCreateElectionForm.bind(ElectionManager);
window.searchCitizen = CitizenManager.searchCitizen.bind(CitizenManager);
window.editCitizenInfo = CitizenManager.editCitizenInfo.bind(CitizenManager);
window.cancelEditCitizen = CitizenManager.cancelEditCitizen.bind(CitizenManager);
window.saveCitizenInfo = CitizenManager.saveCitizenInfo.bind(CitizenManager);

document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard components
  DashboardInit.init();
  
  // Setup forms
  AdminManager.setupCreateAdminForm();
  ElectionManager.setupCreateElectionForm();
  
  // Load initial data
  AdminManager.loadDashboardData();
});