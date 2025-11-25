const { Voto, Candidato, Eleccion, Usuario, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Obtiene todas las elecciones disponibles con su estado
 */
async function getAllElections() {
  try {
    const elecciones = await Eleccion.findAll({
      attributes: ['EleccionID', 'Nombre', 'Estado', 'FechaInicio', 'FechaFin'],
      order: [['FechaCreacion', 'DESC']]
    });
    return elecciones;
  } catch (error) {
    console.error('Error obteniendo elecciones:', error);
    throw error;
  }
}

/**
 * Obtiene resultados completos de una elección específica
 */
async function getElectionResults(eleccionId) {
  try {
    // Obtener información de la elección
    const eleccion = await Eleccion.findByPk(eleccionId);
    if (!eleccion) {
      throw new Error('Elección no encontrada');
    }

    // Total de votos emitidos
    const totalVotos = await Voto.count({
      where: { EleccionID: eleccionId }
    });

    // Total de usuarios en el padrón
    const totalPadron = await Usuario.count();

    // Calcular participación
    const participacion = totalPadron > 0 
      ? ((totalVotos / totalPadron) * 100).toFixed(2)
      : 0;

    // Resultados por candidato (ordenados de mayor a menor)
    const resultadosCandidatos = await sequelize.query(`
      SELECT 
        c.CandidatoID,
        c.Nombre,
        c.Descripcion,
        c.Partido,
        COUNT(v.VotoID) as TotalVotos,
        CAST(
          CASE 
            WHEN (SELECT COUNT(*) FROM Votos WHERE EleccionID = :eleccionId) > 0
            THEN COUNT(v.VotoID) * 100.0 / (SELECT COUNT(*) FROM Votos WHERE EleccionID = :eleccionId)
            ELSE 0
          END 
          AS DECIMAL(5,2)
        ) as Porcentaje
      FROM Candidatos c
      LEFT JOIN Votos v ON c.CandidatoID = v.CandidatoID AND v.EleccionID = :eleccionId
      WHERE c.EleccionID = :eleccionId
      GROUP BY c.CandidatoID, c.Nombre, c.Descripcion, c.Partido
      ORDER BY TotalVotos DESC
    `, {
      replacements: { eleccionId },
      type: QueryTypes.SELECT
    });

    // Resultados por provincia
    const resultadosProvincia = await sequelize.query(`
      SELECT 
        Provincia,
        COUNT(VotoID) as TotalVotos,
        CAST(
          CASE 
            WHEN (SELECT COUNT(*) FROM Votos WHERE EleccionID = :eleccionId) > 0
            THEN COUNT(VotoID) * 100.0 / (SELECT COUNT(*) FROM Votos WHERE EleccionID = :eleccionId)
            ELSE 0
          END 
          AS DECIMAL(5,2)
        ) as Porcentaje
      FROM Votos
      WHERE EleccionID = :eleccionId
      GROUP BY Provincia
      ORDER BY TotalVotos DESC
    `, {
      replacements: { eleccionId },
      type: QueryTypes.SELECT
    });

    // Calcular tendencia (comparar con hace 1 hora)
    const tendencia = await calculateTrend(eleccionId);

    return {
      eleccion: {
        id: eleccion.EleccionID,
        nombre: eleccion.Nombre,
        estado: eleccion.Estado,
        fechaInicio: eleccion.FechaInicio,
        fechaFin: eleccion.FechaFin
      },
      estadisticas: {
        totalVotos,
        totalPadron,
        participacion: parseFloat(participacion),
        tendencia
      },
      candidatos: resultadosCandidatos.map(c => ({
        id: c.CandidatoID,
        nombre: c.Nombre,
        descripcion: c.Descripcion,
        partido: c.Partido,
        votos: c.TotalVotos,
        porcentaje: parseFloat(c.Porcentaje)
      })),
      provincias: resultadosProvincia.map(p => ({
        nombre: p.Provincia,
        votos: p.TotalVotos,
        porcentaje: parseFloat(p.Porcentaje)
      }))
    };

  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    throw error;
  }
}

/**
 * Calcula la tendencia de participación comparando con una hora atrás
 */
async function calculateTrend(eleccionId) {
  try {
    // Votos totales actuales
    const votosActuales = await Voto.count({
      where: { EleccionID: eleccionId }
    });

    // Votos hace una hora usando SQL crudo
    const resultado = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM Votos
      WHERE EleccionID = :eleccionId
      AND FechaVoto <= DATEADD(HOUR, -1, GETDATE())
    `, {
      replacements: { eleccionId },
      type: QueryTypes.SELECT
    });

    const votosHoraAnterior = resultado[0]?.total || 0;

    if (votosHoraAnterior === 0) {
      return 0; // No hay datos para comparar
    }

    // Calcular incremento porcentual
    const incremento = ((votosActuales - votosHoraAnterior) / votosHoraAnterior) * 100;
    return parseFloat(incremento.toFixed(2));

  } catch (error) {
    console.error('Error calculando tendencia:', error);
    return 0;
  }
}

/**
 * Obtiene el candidato líder actual
 */
async function getLeadingCandidate(eleccionId) {
  try {
    const resultado = await sequelize.query(`
      SELECT TOP 1
        c.CandidatoID,
        c.Nombre,
        COUNT(v.VotoID) as TotalVotos
      FROM Candidatos c
      LEFT JOIN Votos v ON c.CandidatoID = v.CandidatoID AND v.EleccionID = :eleccionId
      WHERE c.EleccionID = :eleccionId
      GROUP BY c.CandidatoID, c.Nombre
      ORDER BY TotalVotos DESC
    `, {
      replacements: { eleccionId },
      type: QueryTypes.SELECT
    });

    return resultado[0] || null;
  } catch (error) {
    console.error('Error obteniendo candidato líder:', error);
    return null;
  }
}

module.exports = {
  getAllElections,
  getElectionResults,
  calculateTrend,
  getLeadingCandidate
};
