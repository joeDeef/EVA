// Citizen Management Module
export class CitizenManager {
  static async searchCitizen() {
    const cedula = document.getElementById('searchCedula').value.trim();
    
    if (!cedula) {
      alert('Por favor ingrese un número de cédula');
      return;
    }

    if (cedula.length !== 10) {
      alert('La cédula debe tener 10 dígitos');
      return;
    }

    try {
      const response = await fetch(`/api/citizens/search/${cedula}`);
      
      if (response.ok) {
        const citizen = await response.json();
        this.displayCitizenInfo(citizen);
      } else if (response.status === 404) {
        this.showNoCitizenFound();
      } else {
        alert('Error al buscar ciudadano');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  }

  static displayCitizenInfo(citizen) {
    document.getElementById('citizenCedula').textContent = citizen.Cedula;
    document.getElementById('citizenNombres').textContent = citizen.Nombres;
    document.getElementById('citizenCorreo').textContent = citizen.Correo || 'Sin correo registrado';
    document.getElementById('citizenCorreoInput').value = citizen.Correo || '';
    
    // Update status badges
    const estadoBadge = document.getElementById('citizenEstado');
    const votoBadge = document.getElementById('citizenHaVotado');
    
    estadoBadge.textContent = citizen.Activo ? 'Habilitado' : 'Inhabilitado';
    estadoBadge.className = citizen.Activo ? 'badge badge-success' : 'badge badge-danger';
    
    votoBadge.textContent = citizen.HaVotado ? 'Ya votó' : 'No ha votado';
    votoBadge.className = citizen.HaVotado ? 'badge badge-warning' : 'badge badge-info';
    
    // Show result section and hide no result
    document.getElementById('citizenSearchResult').style.display = 'block';
    document.getElementById('citizenNoResult').style.display = 'none';
    
    // Reset edit mode
    this.cancelEditCitizen();
    
    // Store citizen ID for editing
    window.currentCitizenId = citizen.UsuarioID;
  }

  static showNoCitizenFound() {
    document.getElementById('citizenSearchResult').style.display = 'none';
    document.getElementById('citizenNoResult').style.display = 'block';
  }

  static editCitizenInfo() {
    document.getElementById('citizenEmailDisplay').style.display = 'none';
    document.getElementById('citizenEmailEdit').style.display = 'block';
    document.getElementById('citizenEditActions').style.display = 'block';
    document.getElementById('editCitizenBtn').style.display = 'none';
  }

  static cancelEditCitizen() {
    document.getElementById('citizenEmailDisplay').style.display = 'block';
    document.getElementById('citizenEmailEdit').style.display = 'none';
    document.getElementById('citizenEditActions').style.display = 'none';
    document.getElementById('editCitizenBtn').style.display = 'flex';
  }

  static async saveCitizenInfo() {
    const newEmail = document.getElementById('citizenCorreoInput').value.trim();
    
    if (!newEmail) {
      alert('Por favor ingrese un correo electrónico');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }

    try {
      const response = await fetch(`/api/citizens/update/${window.currentCitizenId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: newEmail })
      });

      if (response.ok) {
        document.getElementById('citizenCorreo').textContent = newEmail;
        this.cancelEditCitizen();
        alert('Correo actualizado exitosamente');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.message || 'No se pudo actualizar el correo'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  }
}