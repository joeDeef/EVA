// Validation script for modular admin dashboard
// Run this in browser console to verify all modules are loaded correctly

function validateDashboardModules() {
  const results = {
    modules: {},
    globalFunctions: {},
    dom: {},
    apis: {}
  };

  // Check if modules are loaded
  console.log('🔍 Checking module availability...');
  
  results.modules.AdminManager = typeof window.AdminManager !== 'undefined';
  results.modules.ElectionManager = typeof window.ElectionManager !== 'undefined';
  results.modules.CitizenManager = typeof window.CitizenManager !== 'undefined';

  // Check global functions
  console.log('🔍 Checking global functions...');
  
  const globalFunctions = [
    'toggleAddAdminForm',
    'editAdminInline', 
    'saveAdminInline',
    'cancelEditAdmin',
    'changeAdminPassword',
    'deleteAdmin',
    'toggleCreateElectionForm',
    'searchCitizen',
    'editCitizenInfo',
    'cancelEditCitizen',
    'saveCitizenInfo'
  ];

  globalFunctions.forEach(func => {
    results.globalFunctions[func] = typeof window[func] === 'function';
  });

  // Check DOM elements
  console.log('🔍 Checking DOM elements...');
  
  const domElements = [
    'newAdminForm',
    'newElectionForm',
    'searchCedula',
    'adminsTableBody',
    'totalVoters',
    'totalAdmins'
  ];

  domElements.forEach(id => {
    results.dom[id] = document.getElementById(id) !== null;
  });

  // Check if event listeners are properly attached
  console.log('🔍 Checking event listeners...');
  
  const newAdminForm = document.getElementById('newAdminForm');
  results.dom.newAdminFormHasListener = newAdminForm && newAdminForm.hasAttribute('data-listener-added');

  const newElectionForm = document.getElementById('newElectionForm');
  results.dom.newElectionFormHasListener = newElectionForm && newElectionForm.hasAttribute('data-listener-added');

  // Summary
  console.log('📊 Validation Results:', results);

  const moduleCount = Object.values(results.modules).filter(Boolean).length;
  const functionCount = Object.values(results.globalFunctions).filter(Boolean).length;
  const domCount = Object.values(results.dom).filter(Boolean).length;

  console.log(`✅ Modules loaded: ${moduleCount}/3`);
  console.log(`✅ Global functions: ${functionCount}/${globalFunctions.length}`);
  console.log(`✅ DOM elements found: ${domCount}/${domElements.length + 2}`);

  const allGood = moduleCount === 3 && 
                 functionCount === globalFunctions.length && 
                 domCount === domElements.length + 2;

  if (allGood) {
    console.log('🎉 All modules loaded successfully!');
  } else {
    console.warn('⚠️  Some modules or functions are missing');
  }

  return results;
}

// Auto-run validation if in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  setTimeout(validateDashboardModules, 1000);
}

// Export for manual use
window.validateDashboardModules = validateDashboardModules;