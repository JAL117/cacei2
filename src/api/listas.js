import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001'
const API_ALUMNOS_URL = 'http://localhost:3002'

/**
 * Obtiene los alumnos registrados desde la base de datos
 * @param {string} tutorId - ID del tutor (opcional, para filtrar por tutor específico)
 * @returns {Promise<Array>} Array de alumnos registrados en la BD
 */
export const getAlumnosRegistrados = async (tutorId = null) => {
  try {
    console.log('🔍 Obteniendo alumnos registrados desde BD...')
    
    // Usar el endpoint que obtiene alumnos básicos registrados
    const response = await axios.get(`${API_ALUMNOS_URL}/alumnos/estudiantes-basica`)
    
    console.log('✅ Respuesta de alumnos registrados:', response.data)
    
    let alumnos = []
    
    // Procesar la respuesta
    if (response.data && Array.isArray(response.data.data)) {
      alumnos = response.data.data.map(alumno => ({
        id: alumno.id || alumno.matricula,
        matricula: alumno.matricula,
        nombre: alumno.nombre,
        // Campos adicionales que puedan venir del backend
        grupo: alumno.grupo || null,
        cuatrimestre: alumno.cuatrimestre || null
      }))
    } else if (Array.isArray(response.data)) {
      alumnos = response.data.map(alumno => ({
        id: alumno.id || alumno.matricula,
        matricula: alumno.matricula,  
        nombre: alumno.nombre,
        grupo: alumno.grupo || null,
        cuatrimestre: alumno.cuatrimestre || null
      }))
    }
    
    console.log(`✅ ${alumnos.length} alumnos registrados obtenidos desde BD`)
    return alumnos
    
  } catch (error) {
    console.error('💥 Error obteniendo alumnos registrados:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron alumnos registrados')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener los alumnos registrados'
    )
  }
}

/**
 * Obtiene los tutorados de un tutor específico
 * @param {string} tutorId - ID del tutor
 * @returns {Promise<Array>} Array de tutorados del tutor
 */
export const getTutoradosByTutor = async (tutorId) => {
  try {
    if (!tutorId) {
      throw new Error('ID del tutor requerido')
    }

    console.log('🔍 Obteniendo tutorados del tutor:', tutorId)

    const response = await axios.get(`${API_ALUMNOS_URL}/api/asistencia-tutorado/tutor/${tutorId}/tutorados`)
    
    console.log('✅ Respuesta de tutorados:', response.data)
    
    if (response.data.tutorados && response.data.tutorados.length === 0) {
      console.log('ℹ️ No se encontraron tutorados para este tutor')
      return []
    }
    
    // Transformar los tutorados al formato esperado
    const tutorados = response.data.tutorados?.map(tutorado => ({
      id: tutorado.id || tutorado.matricula,
      matricula: tutorado.matricula,
      nombre: tutorado.nombre,
      grupo: tutorado.grupo || null
    })) || []
    
    console.log(`✅ ${tutorados.length} tutorados obtenidos para el tutor ${tutorId}`)
    return tutorados
    
  } catch (error) {
    console.error('💥 Error obteniendo tutorados:', error)
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron tutorados para este tutor')
      return []
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener los tutorados del tutor'
    )
  }
}

/**
 * Obtiene los tutorados reales combinando datos de múltiples fuentes
 * @param {string} tutorId - ID del tutor
 * @returns {Promise<Array>} Array de tutorados con información completa
 */
export const getTutoradosReales = async (tutorId) => {
  try {
    console.log('🔍 Obteniendo tutorados reales para tutor:', tutorId)
    
    // Estrategia 1: Intentar obtener tutorados específicos del tutor
    try {
      const tutoradosEspecificos = await getTutoradosByTutor(tutorId)
      if (tutoradosEspecificos && tutoradosEspecificos.length > 0) {
        console.log(`✅ Encontrados ${tutoradosEspecificos.length} tutorados específicos`)
        return tutoradosEspecificos
      }
    } catch (error) {
      console.log('⚠️ No se pudieron obtener tutorados específicos:', error.message)
    }

    // Estrategia 2: Obtener todos los alumnos registrados y filtrar por el tutor
    console.log('🔄 Intentando obtener alumnos registrados y filtrar...')
    try {
      const alumnosRegistrados = await getAlumnosRegistrados()
      
      if (alumnosRegistrados && alumnosRegistrados.length > 0) {
        // Si tenemos una forma de identificar qué alumnos son tutorados de este tutor
        // Por ahora retornamos una muestra para testing (esto debería mejorarse con más lógica de negocio)
        const muestraTutorados = alumnosRegistrados.slice(0, Math.min(10, alumnosRegistrados.length))
        console.log(`📊 Muestra de tutorados (${muestraTutorados.length}) desde alumnos registrados`)
        return muestraTutorados
      }
    } catch (error) {
      console.log('⚠️ No se pudieron obtener alumnos registrados:', error.message)
    }

    // Estrategia 3: Datos de ejemplo si no hay APIs disponibles
    console.log('🔄 Usando datos de ejemplo para desarrollo')
    return [
      {
        id: 'example1',
        matricula: 'T001',
        nombre: 'Ana García López',
        grupo: 'A-101',
        cuatrimestre: '5to'
      },
      {
        id: 'example2', 
        matricula: 'T002',
        nombre: 'Carlos Martínez Ruiz',
        grupo: 'A-101',
        cuatrimestre: '5to'
      },
      {
        id: 'example3',
        matricula: 'T003',
        nombre: 'María Elena Fernández',
        grupo: 'B-102',
        cuatrimestre: '3ro'
      }
    ]
    
  } catch (error) {
    console.error('💥 Error obteniendo tutorados reales:', error)
    throw new Error('Error al obtener la lista de tutorados')
  }
}

/**
 * Procesa un archivo CSV y extrae los datos de alumnos
 * @param {File} file - Archivo CSV a procesar
 * @returns {Promise<Array>} Array de objetos con los datos de los alumnos
 */
export const processCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result
        const lines = csv.split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        
        console.log('📄 Procesando CSV - Headers encontrados:', headers)
        
        // Validar que el CSV tenga las columnas necesarias
        const requiredColumns = ['matricula', 'nombre']
        const missingColumns = requiredColumns.filter(col => !headers.includes(col))
        
        if (missingColumns.length > 0) {
          throw new Error(`Faltan las siguientes columnas en el CSV: ${missingColumns.join(', ')}`)
        }
        
        const alumnos = []
        
        // Procesar cada línea (omitir header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (line) {
            const values = line.split(',').map(v => v.trim())
            
            const alumno = {}
            headers.forEach((header, index) => {
              alumno[header] = values[index] || ''
            })
            
            // Validar que tenga matrícula y nombre
            if (alumno.matricula && alumno.nombre) {
              alumnos.push({
                matricula: alumno.matricula,
                nombre: alumno.nombre
              })
            }
          }
        }
        
        console.log(`✅ CSV procesado - ${alumnos.length} alumnos extraídos`)
        resolve(alumnos)
        
      } catch (error) {
        console.error('💥 Error procesando CSV:', error)
        reject(new Error(`Error procesando archivo CSV: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error leyendo el archivo'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Guarda una lista de alumnos enviando el archivo CSV original del usuario
 * @param {Object} listaData - Datos de la lista
 * @param {number} listaData.materiaId - ID de la materia
 * @param {number} listaData.grupoId - ID del grupo
 * @param {number} listaData.tutorId - ID del tutor/profesor
 * @param {File} listaData.archivoOriginal - Archivo CSV original del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const guardarListaAlumnosConArchivoOriginal = async (listaData) => {
  try {
    console.log('💾 Guardando lista con archivo original:', {
      tutorId: listaData.tutorId,
      grupoId: listaData.grupoId,
      archivo: listaData.archivoOriginal?.name
    })
    
    // Crear FormData para enviar el archivo original
    const formData = new FormData()
    formData.append('tutor_id', listaData.tutorId.toString())
    formData.append('grupo_id', listaData.grupoId.toString())
    formData.append('csv', listaData.archivoOriginal, listaData.archivoOriginal.name)
    
    console.log('📤 Enviando archivo original al backend:', {
      tutor_id: listaData.tutorId,
      grupo_id: listaData.grupoId,
      archivo_nombre: listaData.archivoOriginal.name,
      archivo_tamaño: `${(listaData.archivoOriginal.size / 1024).toFixed(2)} KB`
    })
    
    const response = await axios.post('http://localhost:3002/api/inscripciones/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    
    console.log('✅ Lista guardada exitosamente con archivo original:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error guardando lista con archivo original:', error)
    
    if (error.response) {
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url
      })
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error ||
      `Error al guardar la lista de alumnos: ${error.message}`
    )
  }
}

/**
 * Guarda una lista de alumnos en el backend
 * @param {Object} listaData - Datos de la lista
 * @param {number} listaData.materiaId - ID de la materia
 * @param {number} listaData.grupoId - ID del grupo
 * @param {number} listaData.tutorId - ID del tutor/profesor
 * @param {Array} listaData.alumnos - Array de alumnos con matricula y nombre
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const guardarListaAlumnos = async (listaData) => {
  try {
    console.log('💾 Guardando lista de alumnos:', listaData)
    
    // Convertir los alumnos a formato CSV string
    const csvContent = [
      'matricula,nombre', // Header
      ...listaData.alumnos.map(alumno => `${alumno.matricula},${alumno.nombre}`)
    ].join('\n')
    
    // Crear un Blob con el contenido CSV
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Crear FormData para enviar como archivo
    const formData = new FormData()
    formData.append('tutor_id', listaData.tutorId.toString())
    formData.append('grupo_id', listaData.grupoId.toString())
    formData.append('csv', csvBlob, 'lista-alumnos.csv')
    
    console.log('📤 Enviando datos al backend como FormData:', {
      tutor_id: listaData.tutorId,
      grupo_id: listaData.grupoId,
      csv_file: 'lista-alumnos.csv',
      alumnos_count: listaData.alumnos.length,
      csv_preview: csvContent.substring(0, 100) + '...'
    })

    const response = await axios.post('http://localhost:3002/api/inscripciones/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
    
    console.log('✅ Lista guardada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error guardando lista:', error)
    
    // Log detallado del error
    if (error.response) {
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url
      })
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error ||
      `Error al guardar la lista de alumnos: ${error.message}`
    )
  }
}

/**
 * Obtiene todas las listas de alumnos guardadas con los alumnos reales registrados
 * @returns {Promise<Array>} Array de listas con información completa y alumnos reales
 */
export const obtenerListasConAlumnosReales = async () => {
  try {
    console.log('🔍 Obteniendo listas con alumnos reales registrados...')

    // Obtener las listas guardadas y los alumnos registrados en paralelo
    const [listasResponse, alumnosRegistrados] = await Promise.all([
      axios.get('http://localhost:3002/api/inscripciones/'),
      getAlumnosRegistrados()
    ])

    console.log('✅ Listas obtenidas:', listasResponse.data)
    console.log('✅ Alumnos registrados:', alumnosRegistrados.length)
    
    // Procesar la respuesta para que tenga el formato esperado por el frontend
    let listas = []
    
    if (listasResponse.data && Array.isArray(listasResponse.data.data)) {
      listas = listasResponse.data.data
    } else if (Array.isArray(listasResponse.data)) {
      listas = listasResponse.data
    }
    
    // Transformar las listas y enriquecer con alumnos reales
    const listasFormateadas = await Promise.all(listas.map(async (lista) => {
      let alumnosReales = []
      
      // Si hay tutor_id, obtener sus tutorados específicos
      if (lista.tutor_id) {
        try {
          console.log(`🔍 Obteniendo tutorados para tutor ${lista.tutor_id}`)
          alumnosReales = await getTutoradosByTutor(lista.tutor_id)
        } catch (error) {
          console.warn(`⚠️ No se pudieron obtener tutorados para tutor ${lista.tutor_id}:`, error.message)
          // Fallback: usar todos los alumnos registrados
          alumnosReales = alumnosRegistrados
        }
      } else {
        // Si no hay tutor_id, usar todos los alumnos registrados
        alumnosReales = alumnosRegistrados
      }
      
      return {
        id: lista.id,
        asignatura: lista.asignatura_nombre || lista.asignatura || 'Asignatura no disponible',
        grupo: lista.grupo_numero || lista.grupo || 0,
        profesor: lista.tutor_nombre || lista.profesor || 'Profesor no disponible',
        tutor_id: lista.tutor_id,
        // Usar los alumnos reales de la BD en lugar de los del CSV
        alumnos: alumnosReales,
        // Mantener también los alumnos originales del CSV para referencia
        alumnos_csv: lista.alumnos || []
      }
    }))
    
    console.log(`✅ ${listasFormateadas.length} listas formateadas con alumnos reales`)
    return listasFormateadas
    
  } catch (error) {
    console.error('💥 Error obteniendo listas con alumnos reales:', error)
    
    if (error.response) {
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
      
      // Si es un 404, probablemente no hay listas aún
      if (error.response.status === 404) {
        console.log('ℹ️ No hay listas de alumnos registradas aún')
        return []
      }
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error ||
      'Error al obtener las listas de alumnos con datos reales'
    )
  }
}

/**
 * Obtiene todas las listas de alumnos guardadas (función original)
 * @returns {Promise<Array>} Array de listas con información completa
 */
export const obtenerListasAlumnos = async () => {
  try {
    console.log('🔍 Obteniendo listas de alumnos...')

    const response = await axios.get('http://localhost:3002/api/inscripciones/')

    console.log('✅ Listas obtenidas:', response.data)
    
    // Procesar la respuesta para que tenga el formato esperado por el frontend
    let listas = []
    
    if (response.data && Array.isArray(response.data.data)) {
      listas = response.data.data
    } else if (Array.isArray(response.data)) {
      listas = response.data
    }
    
    // Transformar las listas para que tengan el formato esperado
    const listasFormateadas = listas.map(lista => ({
      id: lista.id,
      asignatura: lista.asignatura_nombre || lista.asignatura || 'Asignatura no disponible',
      grupo: lista.grupo_numero || lista.grupo || 0,
      profesor: lista.tutor_nombre || lista.profesor || 'Profesor no disponible',
      alumnos: lista.alumnos || []
    }))
    
    return listasFormateadas
    
  } catch (error) {
    console.error('💥 Error obteniendo listas:', error)
    
    if (error.response) {
      console.error('Error de respuesta del servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
      
      // Si es un 404, probablemente no hay listas aún
      if (error.response.status === 404) {
        console.log('ℹ️ No hay listas de alumnos registradas aún')
        return []
      }
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error ||
      'Error al obtener las listas de alumnos'
    )
  }
}

/**
 * Obtiene una lista específica por materia y grupo
 * @param {number} materiaId - ID de la materia
 * @param {number} grupoId - ID del grupo
 * @returns {Promise<Object>} Lista específica con alumnos
 */
export const obtenerListaPorMateriaGrupo = async (materiaId, grupoId) => {
  try {
    console.log(`🔍 Obteniendo lista para materia ${materiaId}, grupo ${grupoId}`)
    
    const response = await axios.get(`${API_BASE_URL}/listas/materia/${materiaId}/grupo/${grupoId}`)
    
    console.log('✅ Lista específica obtenida:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error obteniendo lista específica:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener la lista específica'
    )
  }
}

/**
 * Actualiza una lista existente
 * @param {number} listaId - ID de la lista a actualizar
 * @param {Array} alumnos - Nuevos datos de alumnos
 * @returns {Promise<Object>} Lista actualizada
 */
export const actualizarListaAlumnos = async (listaId, alumnos) => {
  try {
    console.log(`🔄 Actualizando lista ${listaId}:`, alumnos)
    
    const response = await axios.put(`${API_BASE_URL}/listas/${listaId}`, {
      alumnos
    })
    
    console.log('✅ Lista actualizada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Error actualizando lista:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al actualizar la lista de alumnos'
    )
  }
}

/**
 * Elimina una lista de alumnos
 * @param {number} listaId - ID de la lista a eliminar
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarListaAlumnos = async (listaId) => {
  try {
    console.log(`🗑️ Eliminando lista ${listaId}`)
    
    const response = await axios.delete(`${API_BASE_URL}/listas/${listaId}`)
    
    console.log('✅ Lista eliminada exitosamente')
    return response.data
    
  } catch (error) {
    console.error('💥 Error eliminando lista:', error)
    throw new Error(
      error.response?.data?.message || 
      'Error al eliminar la lista de alumnos'
    )
  }
}

/**
 * Genera y descarga plantilla CSV para listas de alumnos
 * @returns {void}
 */
export const descargarPlantillaCSV = () => {
  try {
    console.log('📥 Generando plantilla CSV...')
    
    const csvContent = [
      'Matricula,Nombre',
      '202401,Ejemplo Alumno 1',
      '202402,Ejemplo Alumno 2',
      '202403,Ejemplo Alumno 3'
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla-lista-alumnos.csv'
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(url)
    
    console.log('✅ Plantilla CSV descargada')
    
  } catch (error) {
    console.error('💥 Error descargando plantilla:', error)
    throw new Error('Error al generar la plantilla CSV')
  }
}

/**
 * Valida los datos de una lista antes de guardar
 * @param {Object} listaData - Datos a validar
 * @returns {Object} Resultado de validación
 */
export const validarDatosLista = (listaData) => {
  const errores = []
  
  if (!listaData.materiaId) {
    errores.push('Debe seleccionar una materia')
  }
  
  if (!listaData.grupoId) {
    errores.push('Debe seleccionar un grupo')
  }
  
  if (!listaData.tutorId) {
    errores.push('No se pudo obtener el ID del tutor/profesor')
  }
  
  if (!listaData.alumnos || listaData.alumnos.length === 0) {
    errores.push('Debe cargar al menos un alumno')
  }
  
  // Validar formato de alumnos
  if (listaData.alumnos) {
    listaData.alumnos.forEach((alumno, index) => {
      if (!alumno.matricula) {
        errores.push(`Alumno ${index + 1}: Falta matrícula`)
      }
      if (!alumno.nombre) {
        errores.push(`Alumno ${index + 1}: Falta nombre`)
      }
      
      // Validar que la matrícula no tenga caracteres especiales que rompan el CSV
      if (alumno.matricula && alumno.matricula.includes(',')) {
        errores.push(`Alumno ${index + 1}: La matrícula no puede contener comas`)
      }
      
      // Validar que el nombre no tenga caracteres especiales que rompan el CSV
      if (alumno.nombre && alumno.nombre.includes(',')) {
        errores.push(`Alumno ${index + 1}: El nombre no puede contener comas`)
      }
    })
    
    // Verificar matrículas duplicadas
    const matriculas = listaData.alumnos.map(a => a.matricula)
    const matriculasDuplicadas = matriculas.filter((item, index) => matriculas.indexOf(item) !== index)
    
    if (matriculasDuplicadas.length > 0) {
      errores.push(`Matrículas duplicadas: ${matriculasDuplicadas.join(', ')}`)
    }
  }
  
  return {
    esValido: errores.length === 0,
    errores
  }
}
