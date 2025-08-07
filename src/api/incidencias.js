import axios from 'axios'

const API_BASE_URL = 'http://localhost:3002'
const API_INCIDENCIAS_URL = 'http://localhost:3004'

/**
 * Obtiene los alumnos disponibles para el tutor
 * @param {string} tutorId - ID del tutor/profesor
 * @returns {Promise<Array>} Array de alumnos
 */
/**
 * Obtiene los alumnos disponibles desde el endpoint básico
 * @param {string} tutorId - ID del tutor/profesor (no usado en este endpoint)
 * @returns {Promise<Array>} Array de alumnos
 */
export const getAlumnosByTutor = async (tutorId) => {
  try {
    console.log('🔍 Obteniendo alumnos desde endpoint básico')
    
    // Usar el endpoint básico para obtener todos los alumnos
    const response = await axios.get(`${API_BASE_URL}/alumnos/estudiantes-basica`)
    
    console.log('✅ Respuesta de alumnos básica:', response.data)
    
    let alumnos = []
    
    // Procesar la respuesta
    if (response.data && Array.isArray(response.data.data)) {
      alumnos = response.data.data.map(alumno => ({
        id: alumno.id || alumno.matricula,
        matricula: alumno.matricula,
        nombre: alumno.nombre
      }))
    } else if (Array.isArray(response.data)) {
      alumnos = response.data.map(alumno => ({
        id: alumno.id || alumno.matricula,
        matricula: alumno.matricula,  
        nombre: alumno.nombre
      }))
    }
    
    console.log(`✅ ${alumnos.length} alumnos obtenidos desde endpoint básico`)
    return alumnos
    
  } catch (error) {
    console.error('💥 Error obteniendo alumnos:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron alumnos')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener los alumnos'
    )
  }
}

/**
 * Obtiene las materias asignadas al tutor
 * @param {string} tutorId - ID del tutor/profesor
 * @returns {Promise<Array>} Array de materias
 */
export const getMateriasByTutor = async (tutorId) => {
  try {
    console.log('🔍 Obteniendo materias del tutor:', tutorId)
    
    // Usar la función existente para obtener materias disponibles
    const { getMateriasDisponiblesProfesor } = await import('./unidades.js')
    const materias = await getMateriasDisponiblesProfesor(tutorId)
    
    console.log('✅ Materias del tutor obtenidas:', materias)
    return materias
    
  } catch (error) {
    console.error('💥 Error obteniendo materias del tutor:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las materias del tutor'
    )
  }
}

/**
 * Crea una nueva incidencia/intervención
 * @param {Object} incidenciaData - Datos de la incidencia
 * @param {string} incidenciaData.matricula_estudiante - Matrícula del alumno
 * @param {number} incidenciaData.materia_id - ID de la materia
 * @param {string} incidenciaData.tipoDeIntervencion - Tipo de intervención
 * @param {string} incidenciaData.descripcion - Descripción de la incidencia
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createIncidencia = async (incidenciaData) => {
  try {
    console.log('💾 Creando nueva incidencia:', incidenciaData)
    
    const response = await axios.post(`${API_INCIDENCIAS_URL}/api/intervenciones`, incidenciaData)
    
    console.log('✅ Incidencia creada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error creando incidencia:', error)
    
    if (error.response) {
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error ||
      'Error al crear la incidencia'
    )
  }
}

/**
 * Obtiene las incidencias registradas por el tutor
 * @param {string} tutorId - ID del tutor/profesor
 * @returns {Promise<Array>} Array de incidencias procesadas para el frontend
 */
export const getIncidenciasByTutor = async (tutorId) => {
  try {
    console.log('🔍 Obteniendo intervenciones del tutor:', tutorId)
    
    const response = await axios.get(`${API_INCIDENCIAS_URL}/api/intervenciones/tutor/${tutorId}`)
    
    console.log('✅ Respuesta de intervenciones del tutor:', response.data)
    
    if (response.data?.success && response.data?.data?.intervenciones) {
      const intervenciones = response.data.data.intervenciones
      
      // Obtener datos auxiliares para enriquecer la información
      const [alumnosData, materiasData] = await Promise.all([
        getAlumnosByTutor(tutorId).catch(() => []),
        getMateriasByTutor(tutorId).catch(() => [])
      ])
      
      // Crear mapas para búsqueda rápida
      const alumnosMap = new Map()
      alumnosData.forEach(alumno => {
        alumnosMap.set(alumno.matricula, alumno)
      })
      
      const materiasMap = new Map()
      materiasData.forEach(materia => {
        materiasMap.set(materia.id, materia)
      })
      
      // Procesar las intervenciones para el formato esperado por el frontend
      const intervencionesProcesadas = intervenciones.map(intervencion => {
        const alumno = alumnosMap.get(intervencion.matriculaEstudiante)
        const materia = materiasMap.get(intervencion.materiaId)
        
        return {
          id: intervencion.id,
          estudiante: {
            matricula: intervencion.matriculaEstudiante,
            nombre: alumno?.nombre || `Estudiante ${intervencion.matriculaEstudiante}`
          },
          materia: materia?.nombre || `Materia ${intervencion.materiaId}`,
          tipo: intervencion.tipoDeIntervencion,
          descripcion: intervencion.descripcion,
          estado: intervencion.estado,
          fecha: new Date(intervencion.fechaCreacion).toLocaleDateString('es-ES')
        }
      })
      
      console.log('📚 Intervenciones procesadas:', intervencionesProcesadas.length)
      return intervencionesProcesadas
    }
    
    return []
    
  } catch (error) {
    console.error('💥 Error obteniendo intervenciones del tutor:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron intervenciones para este tutor')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las intervenciones del tutor'
    )
  }
}

/**
 * Actualiza una incidencia existente
 * @param {number} incidenciaId - ID de la incidencia
 * @param {Object} incidenciaData - Nuevos datos de la incidencia
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateIncidencia = async (incidenciaId, incidenciaData) => {
  try {
    console.log('🔄 Actualizando incidencia:', { incidenciaId, incidenciaData })

    const response = await axios.put(`${API_INCIDENCIAS_URL}/api/incidencias/${incidenciaId}`, incidenciaData)

    console.log('✅ Incidencia actualizada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error actualizando incidencia:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al actualizar la incidencia'
    )
  }
}

/**
 * Elimina una incidencia
 * @param {number} incidenciaId - ID de la incidencia
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteIncidencia = async (incidenciaId) => {
  try {
    console.log('🗑️ Eliminando incidencia:', incidenciaId)

    const response = await axios.delete(`${API_INCIDENCIAS_URL}/api/incidencias/${incidenciaId}`)

    console.log('✅ Incidencia eliminada exitosamente')
    return response.data
    
  } catch (error) {
    console.error('💥 Error eliminando incidencia:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al eliminar la incidencia'
    )
  }
}

/**
 * Tipos de intervención disponibles
 */
export const TIPOS_INTERVENCION = [
  { 
    value: 'IntervencionesPorProblemasAcademicosPorMateria', 
    label: 'Problemas Académicos por Materia' 
  },
  { 
    value: 'IntervencionesPorProblemasPersonales', 
    label: 'Problemas Personales' 
  },
  { 
    value: 'IntervencionesPorProblemasDeSalud', 
    label: 'Problemas de Salud' 
  }
]

/**
 * Valida los datos de una incidencia antes de enviar
 * @param {Object} incidenciaData - Datos a validar
 * @returns {Object} Resultado de validación
 */
export const validarDatosIncidencia = (incidenciaData) => {
  const errores = []
  
  if (!incidenciaData.matricula_estudiante) {
    errores.push('Debe seleccionar un alumno')
  }
  
  if (!incidenciaData.materia_id) {
    errores.push('Debe seleccionar una materia')
  }
  
  if (!incidenciaData.tutor_id) {
    errores.push('ID del tutor es requerido')
  }
  
  if (!incidenciaData.tipoDeIntervencion) {
    errores.push('Debe seleccionar un tipo de intervención')
  }
  
  if (!incidenciaData.descripcion || incidenciaData.descripcion.trim().length < 10) {
    errores.push('La descripción debe tener al menos 10 caracteres')
  }
  
  // Validar que el tipo de intervención sea válido
  const tiposValidos = TIPOS_INTERVENCION.map(t => t.value)
  if (incidenciaData.tipoDeIntervencion && !tiposValidos.includes(incidenciaData.tipoDeIntervencion)) {
    errores.push('Tipo de intervención no válido')
  }
  
  return {
    esValido: errores.length === 0,
    errores
  }
}