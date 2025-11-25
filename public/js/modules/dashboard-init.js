// Dashboard Initialization Module
export class DashboardInit {
  static initialized = false;

  static init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.initTabs();
    this.initLogout();
    this.initSearch();
  }

  static initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.style.borderBottom = 'none';
          btn.style.color = 'var(--muted-foreground)';
        });
        tabContents.forEach(content => {
          content.classList.remove('active');
          content.style.display = 'none';
        });

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        button.style.borderBottom = '2px solid var(--primary)';
        button.style.color = 'var(--primary)';
        
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
          targetContent.classList.add('active');
          targetContent.style.display = 'block';
        }
      });
    });
  }

  static initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Está seguro que desea cerrar sesión?')) {
          window.location.href = '/admin-login';
        }
      });
    }
  }

  static initSearch() {
    const searchInput = document.getElementById('searchCedula');
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          window.searchCitizen();
        }
      });
      
      // Only allow numbers in cedula input
      searchInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
      });
    }
  }
}