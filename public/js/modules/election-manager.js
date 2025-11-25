// Election Management Module
export class ElectionManager {
  static setupCreateElectionForm() {
    const newElectionForm = document.getElementById('newElectionForm');
    if (newElectionForm && !newElectionForm.hasAttribute('data-listener-added')) {
      newElectionForm.setAttribute('data-listener-added', 'true');
      newElectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const electionData = {
          nombre: formData.get('nombre'),
          fechaInicio: formData.get('fechaInicio'),
          fechaFin: formData.get('fechaFin'),
          tipo: formData.get('tipo'),
          candidatos: formData.get('candidatos')
        };

        try {
          const response = await fetch('/api/elections/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(electionData)
          });

          if (response.ok) {
            alert('Proceso electoral creado exitosamente');
            this.toggleCreateElectionForm();
            // Refresh elections list
            location.reload();
          } else {
            const error = await response.json();
            alert('Error: ' + (error.message || 'No se pudo crear el proceso electoral'));
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error de conexión');
        }
      });
    }
  }

  static toggleCreateElectionForm() {
    const form = document.getElementById('createElectionForm');
    const isHidden = form.classList.contains('hidden');
    
    if (isHidden) {
      form.classList.remove('hidden');
      form.style.display = 'block';
    } else {
      form.classList.add('hidden');
      form.style.display = 'none';
      // Reset form
      document.getElementById('newElectionForm').reset();
    }
  }
}