import axios from 'axios'

const API_BASE_URL_CURSOS = 'http://localhost:3003'
const API_BASE_URL_MATERIAS = 'http://localhost:3002'

/**
 * Obtiene los cursos asignados a un profesor específico
 * @param {string} profesorId - ID del profesor/tutor
 * @returns {Promise<Array>} Array de cursos del profesor
 */
export const getCursosByProfesor = async (profesorId) => {
  try {
    console.log('🔍 Obteniendo cursos del profesor:', profesorId)
    
    const response = await axios.get(`${API_BASE_URL_CURSOS}/curso/cursos/profesor/${profesorId}`)
    
    console.log('✅ Cursos del profesor obtenidos:', response.data)
    
    // Verificar la estructura de respuesta
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      return response.data
    }
    
    console.log('ℹ️ No se encontraron cursos para el profesor')
    return []
    
  } catch (error) {
    console.error('💥 Error obteniendo cursos del profesor:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ Profesor no tiene cursos asignados')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener los cursos del profesor'
    )
  }
}

/**
 * Obtiene información de materias específicas por sus IDs
 * @param {Array} asignaturaIds - Array de IDs de asignaturas
 * @returns {Promise<Array>} Array de materias filtradas
 */
export const getMateriasByIds = async (asignaturaIds) => {
  try {
    console.log('🔍 Obteniendo materias por IDs:', asignaturaIds)
    
    if (!asignaturaIds || asignaturaIds.length === 0) {
      console.log('ℹ️ No hay IDs de asignaturas para buscar')
      return []
    }
    
    // Usar el endpoint de búsqueda múltiple que ya existe
    const response = await axios.post(`${API_BASE_URL_MATERIAS}/api/materias/buscar-multiple`, {
      asignatura_ids: asignaturaIds
    })
    
    console.log('✅ Materias obtenidas:', response.data)
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      return response.data
    }
    
    console.log('ℹ️ No se encontraron materias para los IDs proporcionados')
    return []
    
  } catch (error) {
    console.error('💥 Error obteniendo materias por IDs:', error)
    
    // Fallback: intentar con endpoint individual si falla el múltiple
    if (asignaturaIds.length === 1) {
      try {
        console.log('🔄 Intentando con endpoint individual...')
        const fallbackResponse = await axios.get(`${API_BASE_URL_MATERIAS}/api/materias/${asignaturaIds[0]}`)
        return [fallbackResponse.data.data || fallbackResponse.data]
      } catch (fallbackError) {
        console.error('💥 También falló el endpoint individual:', fallbackError)
      }
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las materias'
    )
  }
}

/**
 * Obtiene las materias disponibles para un profesor
 * Combina la obtención de cursos y filtrado de materias
 * @param {string} profesorId - ID del profesor/tutor
 * @returns {Promise<Array>} Array de materias disponibles para el profesor
 */
export const getMateriasDisponiblesProfesor = async (profesorId) => {
  try {
    console.log('🔍 Obteniendo materias disponibles para profesor:', profesorId)
    
    // Paso 1: Obtener cursos del profesor
    const cursos = await getCursosByProfesor(profesorId)
    
    if (cursos.length === 0) {
      console.log('ℹ️ Profesor no tiene cursos asignados')
      return []
    }
    
    // Paso 2: Extraer IDs únicos de asignaturas
    const asignaturaIds = [...new Set(cursos.map(curso => curso.asignatura_id))]
    console.log('🔍 IDs de asignaturas encontradas:', asignaturaIds)
    
    // Paso 3: Obtener información de las materias
    const materias = await getMateriasByIds(asignaturaIds)
    
    // Paso 4: Agregar información adicional de los cursos a cada materia
    const materiasConCursos = materias.map(materia => {
      const cursosMateria = cursos.filter(curso => curso.asignatura_id === materia.id)
      return {
        ...materia,
        cursos: cursosMateria,
        gruposIds: cursosMateria.map(curso => curso.grupo_id)
      }
    })
    
    console.log('✅ Materias disponibles para el profesor:', materiasConCursos)
    return materiasConCursos
    
  } catch (error) {
    console.error('💥 Error obteniendo materias disponibles:', error)
    throw error
  }
}

/**
 * Crea una nueva unidad académica
 * @param {Object} unidadData - Datos de la unidad a crear
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createUnidad = async (unidadData) => {
  try {
    console.log('💾 Creando nueva unidad:', unidadData)
    
    const response = await axios.post(`${API_BASE_URL_MATERIAS}/api/unidades`, unidadData)
    
    console.log('✅ Unidad creada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error creando unidad:', error)
    
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
      'Error al crear la unidad académica'
    )
  }
}

/**
 * Obtiene las unidades del profesor
 * @param {string} profesorId - ID del profesor/tutor
 * @returns {Promise<Array>} Array de unidades del profesor
 */
export const getUnidadesByProfesor = async (profesorId) => {
  try {
    console.log('🔍 Obteniendo unidades del profesor:', profesorId)
    
    const response = await axios.get(`${API_BASE_URL_MATERIAS}/api/unidades/profesor/${profesorId}`)
    
    console.log('✅ Unidades del profesor obtenidas:', response.data)
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data
    } else if (Array.isArray(response.data)) {
      return response.data
    }
    
    return []
    
  } catch (error) {
    console.error('💥 Error obteniendo unidades del profesor:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ Profesor no tiene unidades registradas')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las unidades del profesor'
    )
  }
}

/**
 * Actualiza una unidad existente
 * @param {number} unidadId - ID de la unidad a actualizar
 * @param {Object} unidadData - Nuevos datos de la unidad
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const updateUnidad = async (unidadId, unidadData) => {
  try {
    console.log('🔄 Actualizando unidad:', { unidadId, unidadData })
    
    const response = await axios.put(`${API_BASE_URL_MATERIAS}/api/unidades/${unidadId}`, unidadData)
    
    console.log('✅ Unidad actualizada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error actualizando unidad:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al actualizar la unidad'
    )
  }
}

/**
 * Elimina una unidad
 * @param {number} unidadId - ID de la unidad a eliminar
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteUnidad = async (unidadId) => {
  try {
    console.log('🗑️ Eliminando unidad:', unidadId)
    
    const response = await axios.delete(`${API_BASE_URL_MATERIAS}/api/unidades/${unidadId}`)
    
    console.log('✅ Unidad eliminada exitosamente')
    return response.data
    
  } catch (error) {
    console.error('💥 Error eliminando unidad:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al eliminar la unidad'
    )
  }
}
