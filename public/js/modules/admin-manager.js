// Admin Management Module
export class AdminManager {
  static async loadDashboardData() {
    try {
      // Load stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        document.getElementById('totalVoters').textContent = stats.totalVotantes.toLocaleString() || '0';
        document.getElementById('participationRate').textContent = stats.votosEmitidos.toLocaleString() || '0';
        document.querySelector('.stat-card:nth-child(3) p').textContent = stats.participacion + '%';
      }

      // Load admins
      await this.loadAdminsList();

      // Set admin info in header (this would come from login session)
      this.setAdminInfo({ nombres: 'Administrador Principal', correo: 'admin@sevotec.ec' });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  static async loadAdminsList() {
    try {
      const adminsResponse = await fetch('/api/admin/list');
      if (adminsResponse.ok) {
        const admins = await adminsResponse.json();
        this.updateAdminsTable(admins);
        document.getElementById('totalAdmins').textContent = admins.length;
      }
    } catch (error) {
      console.error('Error loading admins list:', error);
    }
  }

  static setAdminInfo(admin) {
    const initials = admin.nombres.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    document.getElementById('adminInitials').textContent = initials;
    document.getElementById('adminName').textContent = admin.nombres;
  }

  static updateAdminsTable(admins) {
    const tbody = document.getElementById('adminsTableBody');
    tbody.innerHTML = '';

    admins.forEach(admin => {
      const fechaCreacion = new Date(admin.FechaCreacion).toLocaleDateString();
      const row = `
        <tr data-admin-id="${admin.AdminID}">
          <td class="admin-nombre">${admin.Nombres}</td>
          <td class="admin-correo">${admin.Correo}</td>
          <td>${fechaCreacion}</td>
          <td><span class="badge badge-success">Activo</span></td>
          <td class="admin-actions">
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline" onclick="window.AdminManager.editAdminInline(${admin.AdminID})">Editar</button>
              <button class="btn btn-sm btn-secondary" onclick="window.AdminManager.changeAdminPassword(${admin.AdminID})">Cambiar Contraseña</button>
              <button class="btn btn-sm btn-danger" onclick="window.AdminManager.deleteAdmin(${admin.AdminID})">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }

  static toggleAddAdminForm() {
    const form = document.getElementById('addAdminForm');
    const isVisible = form.style.display !== 'none';
    
    if (isVisible) {
      form.style.display = 'none';
      // Reset form
      document.getElementById('newAdminForm').reset();
    } else {
      form.style.display = 'block';
      // Focus on first input
      document.querySelector('#addAdminForm input[name="nombres"]').focus();
    }
  }

  static setupCreateAdminForm() {
    const newAdminForm = document.getElementById('newAdminForm');
    if (newAdminForm && !newAdminForm.hasAttribute('data-listener-added')) {
      newAdminForm.setAttribute('data-listener-added', 'true');
      newAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Prevenir múltiples submissions
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Creando...';
        }
        
        const formData = new FormData(e.target);
        const adminData = {
          nombres: formData.get('nombres'),
          correo: formData.get('correo'),
          password: formData.get('password')
        };

        try {
          const response = await fetch('/api/admin/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData)
          });

          if (response.ok) {
            alert('Administrador creado exitosamente');
            AdminManager.toggleAddAdminForm();
            e.target.reset();
            await AdminManager.loadAdminsList();
          } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'No se pudo crear el administrador'));
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error de conexión');
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Crear Administrador';
          }
        }
      });
    }
  }

  static editAdminInline(adminId) {
    const row = document.querySelector(`tr[data-admin-id="${adminId}"]`);
    if (!row) return;
    
    const nombreCell = row.querySelector('.admin-nombre');
    const correoCell = row.querySelector('.admin-correo');
    const actionsCell = row.querySelector('.admin-actions');
    
    const currentNombre = nombreCell.textContent;
    const currentCorreo = correoCell.textContent;
    
    nombreCell.innerHTML = `<input type="text" value="${currentNombre}" class="form-control" style="min-width: 200px;">`;
    correoCell.innerHTML = `<input type="email" value="${currentCorreo}" class="form-control" style="min-width: 200px;">`;
    
    actionsCell.innerHTML = `
      <div style="display: flex; gap: 0.5rem;">
        <button onclick="window.AdminManager.saveAdminInline(${adminId})" class="btn btn-sm btn-success">Guardar</button>
        <button onclick="window.AdminManager.cancelEditAdmin(${adminId}, '${currentNombre}', '${currentCorreo}')" class="btn btn-sm btn-outline">Cancelar</button>
      </div>
    `;
  }

  static async saveAdminInline(adminId) {
    const row = document.querySelector(`tr[data-admin-id="${adminId}"]`);
    const nombreInput = row.querySelector('.admin-nombre input');
    const correoInput = row.querySelector('.admin-correo input');
    
    const nombres = nombreInput.value.trim();
    const correo = correoInput.value.trim();
    
    if (!nombres || !correo) {
      alert('Por favor complete todos los campos');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/update/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombres, correo })
      });

      if (response.ok) {
        alert('Administrador actualizado exitosamente');
        await this.loadAdminsList();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'No se pudo actualizar el administrador'));
        await this.loadAdminsList();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      await this.loadAdminsList();
    }
  }

  static cancelEditAdmin(adminId, originalNombre, originalCorreo) {
    const row = document.querySelector(`tr[data-admin-id="${adminId}"]`);
    const nombreCell = row.querySelector('.admin-nombre');
    const correoCell = row.querySelector('.admin-correo');
    const actionsCell = row.querySelector('.admin-actions');
    
    nombreCell.textContent = originalNombre;
    correoCell.textContent = originalCorreo;
    
    actionsCell.innerHTML = `
      <div class="action-buttons">
        <button onclick="window.AdminManager.editAdminInline(${adminId})" class="btn btn-sm btn-outline">Editar</button>
        <button onclick="window.AdminManager.changeAdminPassword(${adminId})" class="btn btn-sm btn-secondary">Cambiar Contraseña</button>
        <button onclick="window.AdminManager.deleteAdmin(${adminId})" class="btn btn-sm btn-danger">Eliminar</button>
      </div>
    `;
  }

  static async changeAdminPassword(adminId) {
    const newPassword = prompt('Ingrese la nueva contraseña:');
    
    if (!newPassword) {
      return;
    }
    
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const confirmPassword = prompt('Confirme la nueva contraseña:');
    
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/update/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        alert('Contraseña actualizada exitosamente');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'No se pudo actualizar la contraseña'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  }

  static async deleteAdmin(adminId) {
    if (confirm('¿Está seguro que desea eliminar este administrador?')) {
      try {
        const response = await fetch(`/api/admin/delete/${adminId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Administrador eliminado exitosamente');
          await this.loadAdminsList();
        } else {
          alert('Error al eliminar administrador');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
      }
    }
  }
}