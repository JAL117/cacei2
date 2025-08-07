import axios from 'axios'
import { getPersonal } from './personal.js'
import { getAlumnos } from './alumnos.js'

// API functions for Dashboard statistics

const API_BASE_URL = 'http://localhost:3001'

/**
 * Obtener estadísticas del personal activo
 * @returns {Object} Estadísticas del personal
 */
export const getPersonalStats = async () => {
  try {
    
    // Obtener lista completa del personal
    const personalList = await getPersonal()
    
    if (!Array.isArray(personalList)) {
      console.log('ℹ️ Dashboard: No hay datos de personal disponibles')
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        porTipo: {
          director: 0,
          docente: 0,
          tutor: 0
        }
      }
    }
    
    // Contar personal activo
    const personalActivo = personalList.filter(person => 
      person.estado === 'Activo' || person.estado === true
    )
    
    // Contar personal inactivo
    const personalInactivo = personalList.filter(person => 
      person.estado === 'Inactivo' || person.estado === false
    )
    
    // Contar por tipo (solo activos)
    const porTipo = personalActivo.reduce((acc, person) => {
      const tipo = person.tipo ? person.tipo.toLowerCase() : 'sin_tipo'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {
      director: 0,
      docente: 0,
      tutor: 0
    })
    
    const stats = {
      total: personalList.length,
      activos: personalActivo.length,
      inactivos: personalInactivo.length,
      porTipo
    }
    
    console.log('✅ Dashboard: Estadísticas del personal calculadas:', stats)
    return stats
    
  } catch (error) {
    console.error('💥 Dashboard: Error al obtener estadísticas del personal:', error)
    return {
      total: 0,
      activos: 0,
      inactivos: 0,
      porTipo: {
        director: 0,
        docente: 0,
        tutor: 0
      }
    }
  }
}

/**
 * Obtener estadísticas de alumnos únicos (sin duplicar matrículas)
 * @returns {Object} Estadísticas de alumnos
 */
export const getAlumnosStats = async () => {
  try {
    console.log('🔍 Dashboard: Obteniendo estadísticas de alumnos...')
    
    // Obtener lista completa de alumnos (incluye historial)
    const alumnosList = await getAlumnos()
    
    if (!Array.isArray(alumnosList)) {
      console.log('ℹ️ Dashboard: No hay datos de alumnos disponibles')
      return {
        totalRegistros: 0,
        alumnosUnicos: 0,
        porCarrera: {},
        porCuatrimestre: {},
        porEstatus: {
          activos: 0,
          inactivos: 0,
          egresados: 0
        }
      }
    }
    
    // Crear un Map para alumnos únicos usando matrícula como clave
    const alumnosUnicos = new Map()
    
    alumnosList.forEach(alumno => {
      const matricula = alumno.matricula
      if (matricula && !alumnosUnicos.has(matricula)) {
        alumnosUnicos.set(matricula, alumno)
      }
    })
    
    // Convertir Map a array para facilitar el procesamiento
    const alumnosUnicosArray = Array.from(alumnosUnicos.values())
    
    // Contar por carrera
    const porCarrera = alumnosUnicosArray.reduce((acc, alumno) => {
      const carrera = alumno.carrera || 'Sin carrera'
      acc[carrera] = (acc[carrera] || 0) + 1
      return acc
    }, {})
    
    // Contar por cuatrimestre
    const porCuatrimestre = alumnosUnicosArray.reduce((acc, alumno) => {
      const cuatrimestre = alumno.cuatrimestreActual || 'Sin cuatrimestre'
      acc[cuatrimestre] = (acc[cuatrimestre] || 0) + 1
      return acc
    }, {})
    
    // Contar por estatus
    const porEstatus = alumnosUnicosArray.reduce((acc, alumno) => {
      const estatus = alumno.estatusAlumno ? alumno.estatusAlumno.toLowerCase() : 'sin_estatus'
      
      if (estatus.includes('activo') || estatus.includes('cursando')) {
        acc.activos += 1
      } else if (estatus.includes('inactivo') || estatus.includes('baja')) {
        acc.inactivos += 1
      } else if (estatus.includes('egresado') || estatus.includes('titulado')) {
        acc.egresados += 1
      }
      
      return acc
    }, {
      activos: 0,
      inactivos: 0,
      egresados: 0
    })
    
    const stats = {
      totalRegistros: alumnosList.length,
      alumnosUnicos: alumnosUnicosArray.length,
      porCarrera,
      porCuatrimestre,
      porEstatus
    }
    
    console.log('✅ Dashboard: Estadísticas de alumnos calculadas:', {
      totalRegistros: stats.totalRegistros,
      alumnosUnicos: stats.alumnosUnicos,
      carreras: Object.keys(stats.porCarrera).length,
      cuatrimestres: Object.keys(stats.porCuatrimestre).length
    })
    
    return stats
    
  } catch (error) {
    console.error('💥 Dashboard: Error al obtener estadísticas de alumnos:', error)
    return {
      totalRegistros: 0,
      alumnosUnicos: 0,
      porCarrera: {},
      porCuatrimestre: {},
      porEstatus: {
        activos: 0,
        inactivos: 0,
        egresados: 0
      }
    }
  }
}

/**
 * Obtener todas las estadísticas del dashboard
 * @returns {Object} Todas las estadísticas combinadas
 */
export const getDashboardStats = async () => {
  try {
    console.log('🔍 Dashboard: Obteniendo todas las estadísticas...')
    
    // Ejecutar ambas consultas en paralelo para mejor rendimiento
    const [personalStats, alumnosStats] = await Promise.all([
      getPersonalStats(),
      getAlumnosStats()
    ])
    
    const dashboardData = {
      personal: personalStats,
      alumnos: alumnosStats,
      timestamp: new Date().toISOString(),
      // Resumen rápido para los cards principales
      summary: {
        totalAlumnos: alumnosStats.alumnosUnicos,
        personalActivo: personalStats.activos,
        // Estos valores se pueden expandir cuando tengamos más APIs
        materiasActivas: 0, // Placeholder para futura implementación
        alertasRiesgo: 0    // Placeholder para futura implementación
      }
    }
    
    console.log('✅ Dashboard: Todas las estadísticas obtenidas exitosamente')
    return dashboardData
    
  } catch (error) {
    console.error('💥 Dashboard: Error al obtener estadísticas generales:', error)
    return {
      personal: {
        total: 0,
        activos: 0,
        inactivos: 0,
        porTipo: { director: 0, docente: 0, tutor: 0 }
      },
      alumnos: {
        totalRegistros: 0,
        alumnosUnicos: 0,
        porCarrera: {},
        porCuatrimestre: {},
        porEstatus: { activos: 0, inactivos: 0, egresados: 0 }
      },
      summary: {
        totalAlumnos: 0,
        personalActivo: 0,
        materiasActivas: 0,
        alertasRiesgo: 0
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Obtener solo el número de personal activo (función simplificada)
 * @returns {number} Cantidad de personal activo
 */
export const getPersonalActivoCount = async () => {
  try {
    const stats = await getPersonalStats()
    return stats.activos
  } catch (error) {
    console.error('💥 Dashboard: Error al obtener contador de personal activo:', error)
    return 0
  }
}

/**
 * Obtener solo el número de alumnos únicos (función simplificada)
 * @returns {number} Cantidad de alumnos únicos
 */
export const getAlumnosUnicosCount = async () => {
  try {
    const stats = await getAlumnosStats()
    return stats.alumnosUnicos
  } catch (error) {
    console.error('💥 Dashboard: Error al obtener contador de alumnos únicos:', error)
    return 0
  }
}
