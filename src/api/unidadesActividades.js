import axios from 'axios'

const API_UNIDADES_URL = 'http://localhost:3003'

/**
 * Crea una nueva unidad académica
 * @param {Object} unidadData - Datos de la unidad
 * @param {number} unidadData.curso_id - ID del curso
 * @param {number} unidadData.numero_unidad - Número de la unidad
 * @param {string} unidadData.nombre_unidad - Nombre de la unidad
 * @param {string} unidadData.descripcion - Descripción de la unidad
 * @returns {Promise<Object>} Respuesta del servidor con el ID de la unidad creada
 */
export const createUnidad = async (unidadData) => {
  try {
    console.log('📚 Creando nueva unidad:', unidadData)
    
    const response = await axios.post(`${API_UNIDADES_URL}/unidades/unidades`, unidadData)
    
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
      'Error al crear la unidad'
    )
  }
}

/**
 * Crea una nueva actividad asociada a una unidad
 * @param {Object} actividadData - Datos de la actividad
 * @param {string} actividadData.unidad_id - UUID de la unidad
 * @param {string} actividadData.nombre_actividad - Nombre de la actividad
 * @param {string} actividadData.descripcion - Descripción de la actividad
 * @param {number} actividadData.ponderacion - Ponderación (como decimal, ej: 0.2 para 20%)
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const createActividad = async (actividadData) => {
  try {
    console.log('📝 Creando nueva actividad:', actividadData)
    
    const response = await axios.post(`${API_UNIDADES_URL}/actividades/actividades`, actividadData)
    
    console.log('✅ Actividad creada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error creando actividad:', error)
    
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
      'Error al crear la actividad'
    )
  }
}

/**
 * Crea una unidad completa con todas sus actividades
 * @param {Object} unidadCompleta - Datos completos de la unidad
 * @param {number} unidadCompleta.curso_id - ID del curso
 * @param {number} unidadCompleta.numero_unidad - Número de la unidad
 * @param {string} unidadCompleta.nombre_unidad - Nombre de la unidad
 * @param {string} unidadCompleta.descripcion - Descripción de la unidad
 * @param {Array} unidadCompleta.actividades - Array de actividades
 * @returns {Promise<Object>} Resultado completo con unidad y actividades creadas
 */
export const createUnidadCompleta = async (unidadCompleta) => {
  try {
    console.log('🎯 Iniciando creación de unidad completa:', unidadCompleta)
    
    // 1. Crear la unidad primero
    const unidadData = {
      curso_id: unidadCompleta.curso_id,
      numero_unidad: unidadCompleta.numero_unidad,
      nombre_unidad: unidadCompleta.nombre_unidad,
      descripcion: unidadCompleta.descripcion
    }
    
    const unidadResult = await createUnidad(unidadData)
    console.log('📚 Unidad creada, obteniendo UUID:', unidadResult)
    
    // Obtener el UUID de la unidad creada
    const unidadId = unidadResult.data?.id || unidadResult.id
    
    if (!unidadId) {
      throw new Error('No se pudo obtener el ID de la unidad creada')
    }
    
    console.log('🔑 UUID de la unidad:', unidadId)
    
    // 2. Crear todas las actividades asociadas a la unidad
    const actividadesCreadas = []
    
    for (const actividad of unidadCompleta.actividades) {
      // Detectar si la ponderación viene como decimal (0.3) o porcentaje (30)
      let ponderacionDecimal = parseFloat(actividad.ponderacion)
      
      // Si el valor es mayor a 1, probablemente es porcentaje y necesita dividirse
      if (ponderacionDecimal > 1) {
        ponderacionDecimal = ponderacionDecimal / 100
        console.log(`🔄 Convirtiendo ponderación de porcentaje a decimal: ${actividad.ponderacion} → ${ponderacionDecimal}`)
      } else {
        console.log(`✅ Ponderación ya en formato decimal: ${actividad.ponderacion}`)
      }
      
      const actividadData = {
        unidad_id: unidadId,
        nombre_actividad: actividad.nombre,
        descripcion: actividad.descripcion,
        ponderacion: ponderacionDecimal // Usar el valor decimal correcto
      }
      
      console.log('📝 Datos de actividad para enviar a la API:', actividadData)
      
      try {
        const actividadResult = await createActividad(actividadData)
        actividadesCreadas.push({
          ...actividad,
          id: actividadResult.data?.id || actividadResult.id,
          unidad_id: unidadId
        })
        
        console.log(`✅ Actividad "${actividad.nombre}" creada exitosamente`)
        
      } catch (error) {
        console.error(`💥 Error creando actividad "${actividad.nombre}":`, error)
        // Continuar con las demás actividades aunque una falle
        actividadesCreadas.push({
          ...actividad,
          error: error.message
        })
      }
    }
    
    const resultado = {
      unidad: {
        id: unidadId,
        ...unidadData
      },
      actividades: actividadesCreadas,
      resumen: {
        unidad_creada: true,
        actividades_totales: unidadCompleta.actividades.length,
        actividades_exitosas: actividadesCreadas.filter(a => !a.error).length,
        actividades_fallidas: actividadesCreadas.filter(a => a.error).length
      }
    }
    
    console.log('🎉 Unidad completa creada:', resultado)
    return resultado
    
  } catch (error) {
    console.error('💥 Error en creación de unidad completa:', error)
    throw error
  }
}

/**
 * Obtiene las unidades de un curso específico (sin actividades)
 * @param {number} cursoId - ID del curso
 * @returns {Promise<Array>} Array de unidades
 */
export const getUnidadesByCurso = async (cursoId) => {
  try {
    console.log('🔍 Obteniendo unidades del curso:', cursoId)
    
    const response = await axios.get(`${API_UNIDADES_URL}/unidades/unidades/curso/${cursoId}`)
    
    console.log('✅ Unidades obtenidas:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || []
    
  } catch (error) {
    console.error('💥 Error obteniendo unidades:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron unidades para este curso')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las unidades del curso'
    )
  }
}

/**
 * Obtiene las unidades de un curso con todas sus actividades (RECOMENDADO)
 * @param {number} cursoId - ID del curso
 * @returns {Promise<Array>} Array de unidades con sus actividades incluidas
 */
export const getUnidadesConActividadesByCurso = async (cursoId) => {
  try {
    console.log('🔍 Obteniendo unidades con actividades del curso:', cursoId)
    
    const response = await axios.get(`${API_UNIDADES_URL}/unidades/unidades/curso/${cursoId}/con-actividades`)
    
    console.log('✅ Unidades con actividades obtenidas:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || []
    
  } catch (error) {
    console.error('💥 Error obteniendo unidades con actividades:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron unidades para este curso')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las unidades con actividades del curso'
    )
  }
}

/**
 * Obtiene una unidad específica por ID
 * @param {string} unidadId - UUID de la unidad
 * @returns {Promise<Object>} Objeto de la unidad
 */
export const getUnidadById = async (unidadId) => {
  try {
    console.log('🔍 Obteniendo unidad por ID:', unidadId)
    
    const response = await axios.get(`${API_UNIDADES_URL}/unidades/unidades/${unidadId}`)
    
    console.log('✅ Unidad obtenida:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || null
    
  } catch (error) {
    console.error('💥 Error obteniendo unidad:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ Unidad no encontrada')
      return null
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener la unidad'
    )
  }
}

/**
 * Obtiene una unidad específica con todas sus actividades
 * @param {string} unidadId - UUID de la unidad
 * @returns {Promise<Object>} Objeto de la unidad con actividades
 */
export const getUnidadConActividadesById = async (unidadId) => {
  try {
    console.log('🔍 Obteniendo unidad con actividades por ID:', unidadId)
    
    const response = await axios.get(`${API_UNIDADES_URL}/unidades/unidades/${unidadId}/con-actividades`)
    
    console.log('✅ Unidad con actividades obtenida:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || null
    
  } catch (error) {
    console.error('💥 Error obteniendo unidad con actividades:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ Unidad no encontrada')
      return null
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener la unidad con actividades'
    )
  }
}

/**
 * Obtiene las actividades de una unidad específica
 * @param {string} unidadId - UUID de la unidad
 * @returns {Promise<Array>} Array de actividades
 */
export const getActividadesByUnidad = async (unidadId) => {
  try {
    console.log('🔍 Obteniendo actividades de la unidad:', unidadId)
    
    const response = await axios.get(`${API_UNIDADES_URL}/actividades/actividades/unidad/${unidadId}`)
    
    console.log('✅ Actividades obtenidas:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || []
    
  } catch (error) {
    console.error('💥 Error obteniendo actividades:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron actividades para esta unidad')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las actividades de la unidad'
    )
  }
}

/**
 * Obtiene todas las unidades del sistema
 * @returns {Promise<Array>} Array de todas las unidades
 */
export const getAllUnidades = async () => {
  try {
    console.log('🔍 Obteniendo todas las unidades')
    
    const response = await axios.get(`${API_UNIDADES_URL}/unidades/unidades`)
    
    console.log('✅ Todas las unidades obtenidas:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || []
    
  } catch (error) {
    console.error('💥 Error obteniendo todas las unidades:', error)
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener todas las unidades'
    )
  }
}

/**
 * Obtiene todas las actividades del sistema
 * @returns {Promise<Array>} Array de todas las actividades
 */
export const getAllActividades = async () => {
  try {
    console.log('🔍 Obteniendo todas las actividades')
    
    const response = await axios.get(`${API_UNIDADES_URL}/actividades/actividades`)
    
    console.log('✅ Todas las actividades obtenidas:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || []
    
  } catch (error) {
    console.error('💥 Error obteniendo todas las actividades:', error)
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener todas las actividades'
    )
  }
}

/**
 * Obtiene una actividad específica por ID
 * @param {number} actividadId - ID de la actividad
 * @returns {Promise<Object>} Objeto de la actividad
 */
export const getActividadById = async (actividadId) => {
  try {
    console.log('🔍 Obteniendo actividad por ID:', actividadId)
    
    const response = await axios.get(`${API_UNIDADES_URL}/actividades/actividades/${actividadId}`)
    
    console.log('✅ Actividad obtenida:', response.data)
    
    if (response.data?.success && response.data?.data) {
      return response.data.data
    }
    
    return response.data?.data || response.data || null
    
  } catch (error) {
    console.error('💥 Error obteniendo actividad:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ Actividad no encontrada')
      return null
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener la actividad'
    )
  }
}

/**
 * Validación para datos de unidad
 * @param {Object} unidadData - Datos de la unidad a validar
 * @returns {Object} Resultado de validación
 */
export const validarDatosUnidad = (unidadData) => {
  const errores = []
  
  if (!unidadData.curso_id) {
    errores.push('Debe seleccionar un curso')
  }
  
  if (!unidadData.numero_unidad || unidadData.numero_unidad < 1) {
    errores.push('El número de unidad debe ser mayor a 0')
  }
  
  if (!unidadData.nombre_unidad || unidadData.nombre_unidad.trim().length < 3) {
    errores.push('El nombre de la unidad debe tener al menos 3 caracteres')
  }
  
  if (!unidadData.descripcion || unidadData.descripcion.trim().length < 10) {
    errores.push('La descripción debe tener al menos 10 caracteres')
  }
  
  return {
    esValido: errores.length === 0,
    errores
  }
}

/**
 * Validación para datos de actividad
 * @param {Object} actividadData - Datos de la actividad a validar
 * @returns {Object} Resultado de validación
 */
export const validarDatosActividad = (actividadData) => {
  const errores = []
  
  if (!actividadData.nombre_actividad || actividadData.nombre_actividad.trim().length < 3) {
    errores.push('El nombre de la actividad debe tener al menos 3 caracteres')
  }
  
  if (!actividadData.descripcion || actividadData.descripcion.trim().length < 5) {
    errores.push('La descripción debe tener al menos 5 caracteres')
  }
  
  if (!actividadData.ponderacion || actividadData.ponderacion <= 0 || actividadData.ponderacion > 1) {
    errores.push('La ponderación debe estar entre 0.01 y 1.00')
  }
  
  return {
    esValido: errores.length === 0,
    errores
  }
}

/**
 * Validación completa para unidad con actividades
 * @param {Object} unidadCompleta - Datos completos a validar
 * @returns {Object} Resultado de validación
 */
export const validarUnidadCompleta = (unidadCompleta) => {
  const errores = []
  
  // Validar datos básicos de la unidad
  const validacionUnidad = validarDatosUnidad(unidadCompleta)
  errores.push(...validacionUnidad.errores)
  
  // Validar que tenga actividades
  if (!unidadCompleta.actividades || unidadCompleta.actividades.length === 0) {
    errores.push('Debe agregar al menos una actividad')
  } else {
    // Validar cada actividad
    unidadCompleta.actividades.forEach((actividad, index) => {
      const actividadParaValidar = {
        nombre_actividad: actividad.nombre,
        descripcion: actividad.descripcion,
        ponderacion: parseFloat(actividad.ponderacion) // Ya viene como decimal (0.0 - 1.0)
      }
      
      const validacionActividad = validarDatosActividad(actividadParaValidar)
      validacionActividad.errores.forEach(error => {
        errores.push(`Actividad ${index + 1}: ${error}`)
      })
    })
    
    // Validar que la suma de ponderaciones sea 1.0 (100% en decimal)
    const totalPonderacion = unidadCompleta.actividades.reduce(
      (total, actividad) => total + parseFloat(actividad.ponderacion || 0), 
      0
    )
    
    console.log('🔍 Validación ponderaciones:', {
      actividades: unidadCompleta.actividades.map(a => ({ 
        nombre: a.nombre, 
        ponderacion: a.ponderacion 
      })),
      totalPonderacion,
      esperado: 1.0
    })
    
    if (Math.abs(totalPonderacion - 1.0) > 0.01) {
      errores.push(`La suma de las ponderaciones debe ser exactamente 100% (recibido: ${(totalPonderacion * 100).toFixed(2)}%)`)
    }
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    primerError: errores[0] || null
  }
}
