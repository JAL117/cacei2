import axios from 'axios'

// API functions for Asistencia Tutorado management

const API_BASE_URL = 'http://localhost:3000'

// Obtener lista de tutores disponibles (esto vendría de la base de datos de alumnos)
export const getTutoresDisponibles = async () => {
  try {
    // Por ahora retornamos tutores de ejemplo
    // En producción esto vendría de una API de usuarios/docentes
    return [
      { id: '2', nombre: 'Mai' },
      { id: '1', nombre: 'Jose Albertommh' }
    ]
  } catch (error) {
    console.error('Error fetching tutores:', error)
    return []
  }
}

// Obtener estudiantes tutorados por tutor académico
export const getTutoradosByTutor = async (tutorId) => {
  try {
    if (!tutorId) {
      throw new Error('ID del tutor requerido')
    }

    const response = await axios.get(`${API_BASE_URL}/api/asistencia-tutorado/tutor/${tutorId}/tutorados`)
    
    if (response.data.tutorados && response.data.tutorados.length === 0) {
      console.log('No se encontraron tutorados para este tutor')
      return {
        tutor_id: tutorId,
        total_tutorados: 0,
        tutorados: []
      }
    }
    
    return response.data
  } catch (error) {
    console.error('Error fetching tutorados:', error)
    
    // Si hay error, retornar estructura vacía
    return {
      tutor_id: tutorId,
      total_tutorados: 0,
      tutorados: []
    }
  }
}

// Obtener lista de asistencia del día para un tutor
export const getListaAsistencia = async (tutorId, fecha = null) => {
  try {
    const fechaParam = fecha ? `?fecha=${fecha}` : ''
    const response = await axios.get(`${API_BASE_URL}/api/asistencia-tutorado/tutor/${tutorId}/lista-asistencia${fechaParam}`)
    
    return response.data
  } catch (error) {
    console.error('Error fetching lista asistencia:', error)
    
    // En caso de error, retornar estructura básica
    return {
      tutor_academico: tutorId,
      fecha: fecha || new Date().toISOString().split('T')[0],
      tutorados: [],
      asistencias_existentes: []
    }
  }
}

// Pasar lista (marcar asistencias)
export const pasarLista = async (tutorId, asistenciaData) => {
  try {
    console.log('Datos de asistencia a enviar:', asistenciaData)
    
    const dataToSend = {
      fecha: asistenciaData.fecha,
      asistencias: asistenciaData.registros.map(registro => ({
        matricula: registro.matricula,
        estado: mapEstadoToBackend(registro.estado),
        observaciones: registro.observaciones || ''
      }))
    }
    
    const response = await axios.post(`${API_BASE_URL}/api/asistencia-tutorado/tutor/${tutorId}/pasar-lista`, dataToSend)
    
    return {
      success: true,
      data: response.data,
      message: 'Lista de asistencia guardada correctamente'
    }
  } catch (error) {
    console.error('Error al pasar lista:', error)
    
    return {
      success: false,
      message: error.response?.data?.message || 'Error al guardar la lista de asistencia',
      error: error.response?.data || error.message
    }
  }
}

// Obtener historial de asistencias de un tutor
export const getHistorialAsistencias = async (tutorId, limit = 50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/asistencia-tutorado/tutor/${tutorId}/historial?limit=${limit}`)
    
    return response.data
  } catch (error) {
    console.error('Error fetching historial:', error)
    
    return {
      tutor_academico: tutorId,
      total_registros: 0,
      historial: []
    }
  }
}

// Obtener todas las asistencias (para compatibilidad con el código existente)
export const getAsistencias = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/asistencia-tutorado`)
    
    if (!response.data || response.data.length === 0) {
      console.log('Aun no se han registrado asistencias')
      return []
    }
    
    return response.data
  } catch (error) {
    console.error('Error fetching asistencias:', error)
    return []
  }
}

// Función auxiliar para mapear estados del frontend al backend
const mapEstadoToBackend = (estadoFrontend) => {
  const mapeo = {
    'present': 'PRESENTE',
    'late': 'RETARDO',
    'absent': 'AUSENTE',
    'excuse': 'JUSTIFICADO'
  }
  
  return mapeo[estadoFrontend] || 'PRESENTE'
}

// Función auxiliar para mapear estados del backend al frontend
export const mapEstadoToFrontend = (estadoBackend) => {
  const mapeo = {
    'PRESENTE': 'present',
    'RETARDO': 'late',
    'AUSENTE': 'absent',
    'JUSTIFICADO': 'excuse'
  }
  
  return mapeo[estadoBackend] || 'present'
}

// Validar datos de asistencia antes de enviar
export const validarDatosAsistencia = (asistenciaData) => {
  const errores = []
  
  if (!asistenciaData.fecha) {
    errores.push('La fecha es requerida')
  }
  
  if (!asistenciaData.tutorId) {
    errores.push('El ID del tutor es requerido')
  }
  
  if (!asistenciaData.registros || asistenciaData.registros.length === 0) {
    errores.push('Debe haber al menos un registro de asistencia')
  }
  
  // Validar estructura de registros
  if (asistenciaData.registros) {
    asistenciaData.registros.forEach((registro, index) => {
      if (!registro.matricula) {
        errores.push(`Falta matrícula del estudiante en el registro ${index + 1}`)
      }
      if (!registro.estado || !['present', 'late', 'absent', 'excuse'].includes(registro.estado)) {
        errores.push(`Estado inválido en el registro ${index + 1}`)
      }
    })
  }
  
  return {
    valido: errores.length === 0,
    errores
  }
}

// Generar estructura de datos para CSV local (específico para tutorados)
export const generarCSVTutorados = (asistenciaData, tutorNombre) => {
  const fechaFormateada = new Date(asistenciaData.fecha).toLocaleDateString('es-ES')
  
  // Mapear estados a etiquetas legibles
  const estadosMap = {
    present: 'Presente',
    late: 'Retardo',
    absent: 'Ausente',
    excuse: 'Justificado'
  }
  
  // Calcular estadísticas
  const stats = asistenciaData.registros.reduce((acc, registro) => {
    acc[registro.estado] = (acc[registro.estado] || 0) + 1
    return acc
  }, {})
  
  // Crear contenido del CSV
  const headerInfo = [
    `# LISTA DE ASISTENCIA DE TUTORADOS - ${fechaFormateada}`,
    `# Tutor Académico: ${tutorNombre || asistenciaData.tutorId}`,
    `# Generada: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`,
    `#`,
    `# Total tutorados: ${asistenciaData.registros.length}`,
    `# Presentes: ${stats.present || 0}`,
    `# Retardos: ${stats.late || 0}`,
    `# Ausentes: ${stats.absent || 0}`,
    `# Justificados: ${stats.excuse || 0}`,
    `#`,
    ''
  ]
  
  const headers = ['Matrícula', 'Nombre', 'Carrera', 'Cuatrimestre', 'Grupo', 'Estado', 'Observaciones']
  
  const csvData = [
    ...headerInfo,
    headers.join(','),
    ...asistenciaData.registros.map(registro => [
      registro.matricula,
      `"${registro.nombre || ''}"`,
      registro.carrera || '',
      registro.cuatrimestre || '',
      registro.grupo || '',
      estadosMap[registro.estado] || 'No definido',
      `"${registro.observaciones || ''}"`
    ].join(','))
  ].join('\n')
  
  return csvData
}

// Descargar CSV generado localmente
export const descargarCSVLocal = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Crear datos de prueba
export const crearDatosPrueba = async () => {
  try {
    // Crear estudiantes de prueba
    const responseEstudiantes = await axios.post(`${API_BASE_URL}/api/asistencia-tutorado/estudiantes-prueba`)
    console.log('Estudiantes de prueba:', responseEstudiantes.data)
    
    // Crear registros de asistencia de prueba
    const responseAsistencias = await axios.post(`${API_BASE_URL}/api/asistencia-tutorado/datos-prueba`)
    console.log('Asistencias de prueba:', responseAsistencias.data)
    
    return {
      success: true,
      message: 'Datos de prueba creados exitosamente',
      estudiantes: responseEstudiantes.data,
      asistencias: responseAsistencias.data
    }
  } catch (error) {
    console.error('Error al crear datos de prueba:', error)
    return {
      success: false,
      message: 'Error al crear datos de prueba'
    }
  }
}
