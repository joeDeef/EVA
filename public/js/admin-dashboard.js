document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadAdmins();
    setupForms();
});

// Cargar Estadísticas
async function loadStats() {
    try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        
        document.getElementById('totalVoters').textContent = data.totalVotantes;
        document.getElementById('participationRate').textContent = data.participacion + '%';
        document.getElementById('activeElections').textContent = data.eleccionesActivas;
    } catch (error) {
        console.error('Error cargando stats:', error);
    }
}

// Cargar Lista de Admins
async function loadAdmins() {
    try {
        const res = await fetch('/api/admin/users');
        const admins = await res.json();
        const tbody = document.querySelector('#adminsTable tbody');
        tbody.innerHTML = '';

        admins.forEach(admin => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${admin.AdminID}</td>
                <td>${admin.Nombres}</td>
                <td>${admin.Correo}</td>
                <td><span class="badge badge-success">Activo</span></td>
                <td><button class="btn btn-outline" style="padding: 2px 8px;">Editar</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error cargando admins:', error);
    }
}

// Configurar Formularios
function setupForms() {
    // Crear Elección
    document.getElementById('createElectionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch('/api/admin/elections', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if(res.ok) {
            alert('Elección creada correctamente');
            e.target.reset();
            loadStats(); // Recargar contadores
        }
    });

    // Crear Admin
    document.getElementById('newAdminForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if(res.ok) {
            alert('Administrador agregado');
            e.target.reset();
            document.getElementById('addAdminForm').style.display = 'none';
            loadAdmins();
        }
    });
}