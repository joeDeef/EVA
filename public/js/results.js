// Estado global
let currentElectionId = null;
let pollingInterval = null;
let lastUpdate = null;

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadElections();
  setupElectionSelector();
});

/**
 * Carga todas las elecciones disponibles
 */
async function loadElections() {
  try {
    const response = await fetch('/api/results/elections');
    const data = await response.json();

    if (data.success && data.elecciones.length > 0) {
      populateElectionSelector(data.elecciones);
      
      // Seleccionar la primera elección activa o la primera disponible
      const activeElection = data.elecciones.find(e => e.Estado === 'Activa');
      const defaultElection = activeElection || data.elecciones[0];
      
      currentElectionId = defaultElection.EleccionID;
      document.getElementById('election-select').value = currentElectionId;
      
      // Cargar resultados iniciales
      loadResults();
      startPolling();
    } else {
      showError('No hay elecciones disponibles');
    }
  } catch (error) {
    console.error('Error cargando elecciones:', error);
    showError('Error al cargar elecciones');
  }
}

/**
 * Llena el selector de elecciones
 */
function populateElectionSelector(elecciones) {
  const select = document.getElementById('election-select');
  select.innerHTML = elecciones.map(eleccion => {
    const estado = eleccion.Estado === 'Activa' 
      ? '<span style="color: var(--success);">● Activa</span>' 
      : '<span style="color: var(--muted-foreground);">○ Cerrada</span>';
    
    return `<option value="${eleccion.EleccionID}">
      ${eleccion.Nombre} ${eleccion.Estado === 'Activa' ? '(Activa)' : '(Cerrada)'}
    </option>`;
  }).join('');
}

/**
 * Configura el evento del selector de elecciones
 */
function setupElectionSelector() {
  const select = document.getElementById('election-select');
  select.addEventListener('change', (e) => {
    currentElectionId = e.target.value;
    
    // Detener polling anterior
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Cargar nueva elección
    loadResults();
    startPolling();
  });
}

/**
 * Carga los resultados de la elección actual
 */
async function loadResults() {
  if (!currentElectionId) return;

  try {
    // Animar indicador de actualización
    const indicator = document.getElementById('live-indicator');
    indicator.style.animation = 'none';
    setTimeout(() => {
      indicator.style.animation = 'pulse 2s infinite';
    }, 10);

    const response = await fetch(`/api/results/${currentElectionId}`);
    const data = await response.json();

    if (data.success) {
      updateUI(data);
      lastUpdate = new Date();
    } else {
      showError(data.message || 'Error al cargar resultados');
    }
  } catch (error) {
    console.error('Error cargando resultados:', error);
    showError('Error de conexión al servidor');
  }
}

/**
 * Actualiza toda la interfaz con los datos recibidos
 */
function updateUI(data) {
  updateStats(data.estadisticas);
  updateCandidates(data.candidatos);
  updateProvinces(data.provincias);
}

/**
 * Actualiza las estadísticas principales
 */
function updateStats(stats) {
  // Total de votos
  document.getElementById('total-votes').textContent = stats.totalVotos.toLocaleString();

  // Participación
  document.getElementById('participation').textContent = `${stats.participacion}%`;
  document.getElementById('participation-detail').textContent = 
    `${stats.totalVotos} de ${stats.totalPadron} votantes`;

  // Tendencia
  const tendencia = stats.tendencia || 0;
  const trendValue = document.getElementById('trend-value');
  const trendIcon = document.getElementById('trend-icon');
  
  const isPositive = tendencia >= 0;
  const color = isPositive ? 'var(--success)' : 'var(--destructive)';
  const sign = isPositive ? '+' : '';
  
  trendValue.textContent = `${sign}${tendencia}%`;
  trendValue.style.color = color;
  trendIcon.style.color = color;
  
  // Cambiar icono según tendencia
  if (isPositive) {
    trendIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>';
  } else {
    trendIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17H5m0 0V9m0 8l8-8 4 4 6-6"></path>';
  }
}

/**
 * Actualiza la lista de candidatos con barras de progreso
 */
function updateCandidates(candidatos) {
  const container = document.getElementById('results-container');
  
  if (!candidatos || candidatos.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">No hay votos registrados aún</p>';
    return;
  }

  container.innerHTML = candidatos.map((candidato, index) => {
    const isLeader = index === 0;
    const badge = isLeader 
      ? '<span class="badge badge-primary" style="margin-left: 0.5rem;">Líder</span>' 
      : '';
    
    return `
      <div class="card animate-fade-in" style="animation-delay: ${index * 0.1}s;">
        <div class="flex-between mb-4">
          <div>
            <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem;">
              ${candidato.nombre}
              ${badge}
            </h3>
            <p class="text-muted" style="font-size: 0.875rem;">
              ${candidato.descripcion || candidato.partido || ''}
            </p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">
              ${candidato.porcentaje}%
            </p>
            <p class="text-muted" style="font-size: 0.875rem;">
              ${candidato.votos.toLocaleString()} votos
            </p>
          </div>
        </div>
        
        <div class="progress">
          <div class="progress-bar" style="width: ${candidato.porcentaje}%; background: ${isLeader ? 'var(--primary)' : 'var(--accent)'};">
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Actualiza los resultados por provincia
 */
function updateProvinces(provincias) {
  const container = document.getElementById('provinces-container');
  
  if (!provincias || provincias.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">No hay votos por provincia</p>';
    return;
  }

  container.innerHTML = provincias.map(provincia => `
    <div class="flex-between" style="padding: 0.75rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);">
      <div>
        <span style="font-weight: 600;">${provincia.nombre}</span>
      </div>
      <div class="flex gap-4" style="align-items: center;">
        <div class="progress" style="width: 200px;">
          <div class="progress-bar" style="width: ${provincia.porcentaje}%;"></div>
        </div>
        <span style="font-weight: 600; color: var(--primary); min-width: 60px; text-align: right;">
          ${provincia.votos} votos
        </span>
      </div>
    </div>
  `).join('');
}

/**
 * Inicia el polling automático cada 10 segundos
 */
function startPolling() {
  // Limpiar intervalo anterior si existe
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Polling cada 10 segundos
  pollingInterval = setInterval(() => {
    loadResults();
  }, 10000); // 10000ms = 10 segundos

  console.log('Polling iniciado: actualizando cada 10 segundos');
}

/**
 * Detiene el polling
 */
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('Polling detenido');
  }
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
  const container = document.getElementById('results-container');
  container.innerHTML = `
    <div class="alert alert-error">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
}

// Detener polling al salir de la página
window.addEventListener('beforeunload', () => {
  stopPolling();
});

// Reanudar polling al volver a la pestaña
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    loadResults();
    startPolling();
  }
});
