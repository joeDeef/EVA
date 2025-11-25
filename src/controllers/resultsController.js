const resultsService = require('../services/resultsService');
const path = require('path');

/**
 * Renderiza la página de resultados (HTML)
 */
exports.viewResults = (req, res) => {
  const viewPath = path.join(__dirname, '../../public/views', 'results.html');
  res.sendFile(viewPath);
};

/**
 * Obtiene todas las elecciones disponibles
 * GET /api/results/elections
 */
exports.getElections = async (req, res) => {
  try {
    const elecciones = await resultsService.getAllElections();
    res.json({
      success: true,
      elecciones
    });
  } catch (error) {
    console.error('Error en getElections:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener elecciones',
      error: error.message
    });
  }
};

/**
 * Obtiene resultados completos de una elección
 * GET /api/results/:eleccionId
 */
exports.getResults = async (req, res) => {
  try {
    const eleccionId = req.params.eleccionId || req.query.eleccionId;

    if (!eleccionId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la elección'
      });
    }

    const resultados = await resultsService.getElectionResults(eleccionId);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...resultados
    });

  } catch (error) {
    console.error('Error en getResults:', error);
    
    if (error.message === 'Elección no encontrada') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al obtener resultados',
      error: error.message
    });
  }
};

/**
 * Obtiene solo las estadísticas generales (más ligero)
 * GET /api/results/:eleccionId/stats
 */
exports.getStats = async (req, res) => {
  try {
    const eleccionId = req.params.eleccionId;

    if (!eleccionId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la elección'
      });
    }

    const resultados = await resultsService.getElectionResults(eleccionId);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      eleccion: resultados.eleccion,
      estadisticas: resultados.estadisticas
    });

  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Obtiene el candidato líder
 * GET /api/results/:eleccionId/leader
 */
exports.getLeader = async (req, res) => {
  try {
    const eleccionId = req.params.eleccionId;

    if (!eleccionId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID de la elección'
      });
    }

    const lider = await resultsService.getLeadingCandidate(eleccionId);

    res.json({
      success: true,
      lider
    });

  } catch (error) {
    console.error('Error en getLeader:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener líder',
      error: error.message
    });
  }
};

module.exports = exports;
