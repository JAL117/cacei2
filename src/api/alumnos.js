import axios from 'axios'

// API functions for Alumnos management

const API_BASE_URL = 'http://localhost:3002'

// Obtener todos los alumnos
export const getAlumnos = async () => {
  try {
    console.log('🔍 Frontend: Solicitando alumnos desde:', `${API_BASE_URL}/alumnos/listar`)
    
    const response = await axios.get(`${API_BASE_URL}/alumnos/listar`)
    
    console.log('📊 Frontend: Respuesta recibida:', {
      status: response.status,
      dataType: typeof response.data,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : 'no-data'
    })
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.data && response.data.success === false) {
      if (response.data.message === 'No se encontraron alumnos') {
        console.log('ℹ️ Frontend: No hay alumnos registrados')
        return []
      }
    }
    
    // Si la respuesta tiene estructura { success: true, data: [...] }
    if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
      console.log('✅ Frontend: Alumnos obtenidos exitosamente:', response.data.data.length)
      return response.data.data
    }
    
    // Si la respuesta es directamente un array
    if (Array.isArray(response.data)) {
      console.log('✅ Frontend: Alumnos obtenidos (array directo):', response.data.length)
      return response.data
    }
    
    // Si no hay datos, retornar array vacío
    console.log('ℹ️ Frontend: No se encontraron datos válidos')
    return []
    
  } catch (error) {
    console.error('💥 Frontend: Error al obtener alumnos:', error)
    
    // Verificar si es un error 404 con el mensaje específico
    if (error.response && error.response.status === 404) {
      if (error.response.data && error.response.data.message === 'No se encontraron alumnos') {
        console.log('ℹ️ Frontend: Error 404 - No hay alumnos registrados')
        return []
      }
    }
    
    // Retornar array vacío en caso de error para evitar que la UI se rompa
    return []
  }
}

// Obtener historial completo de un alumno por matrícula
export const getAlumnoHistorial = async (matricula) => {
  try {
    console.log(`🔍 Frontend: Solicitando historial para matrícula: ${matricula}`)
    
    const response = await axios.get(`${API_BASE_URL}/alumnos/matricula/${matricula}`)
    
    if (response.data && response.data.success === true) {
      console.log('✅ Frontend: Historial obtenido exitosamente')
      return response.data.data
    }
    
    return null
  } catch (error) {
    console.error('💥 Frontend: Error al obtener historial del alumno:', error)
    if (error.response && error.response.status === 404) {
      return null
    }
    throw error
  }
}

// Crear nuevo alumno
export const createAlumno = async (alumnoData) => {
  try {
    console.log('🔍 Frontend: Creando alumno:', alumnoData);
    
    const response = await axios.post(`${API_BASE_URL}/alumnos/crear`, {
      matricula: alumnoData.matricula,
      nombre: alumnoData.nombre,
      carrera: alumnoData.carrera,
      estatusAlumno: alumnoData.estatusAlumno || 'Inscrito',
      cuatrimestreActual: alumnoData.cuatrimestreActual,
      grupoActual: alumnoData.grupoActual,
      materia: alumnoData.materia,
      periodo: alumnoData.periodo,
      estatusMateria: alumnoData.estatusMateria || 'Sin cursar',
      final: alumnoData.final || 0,
      extra: alumnoData.extra || 'N/A',
      estatusCardex: alumnoData.estatusCardex || 'Vigente',
      periodoCursado: alumnoData.periodoCursado,
      planEstudiosClave: alumnoData.planEstudiosClave,
      creditos: alumnoData.creditos,
      tutorAcademico: alumnoData.tutorAcademico
    })
    
    // Construir el objeto completo con todos los campos
    const newAlumno = {
      id: response.data.id || Date.now(),
      matricula: alumnoData.matricula,
      nombre: alumnoData.nombre,
      carrera: alumnoData.carrera,
      estatusAlumno: alumnoData.estatusAlumno || 'Inscrito',
      cuatrimestreActual: alumnoData.cuatrimestreActual,
      grupoActual: alumnoData.grupoActual,
      materia: alumnoData.materia,
      periodo: alumnoData.periodo,
      estatusMateria: alumnoData.estatusMateria || 'Sin cursar',
      final: alumnoData.final || 0,
      extra: alumnoData.extra || 'N/A',
      estatusCardex: alumnoData.estatusCardex || 'Vigente',
      periodoCursado: alumnoData.periodoCursado,
      planEstudiosClave: alumnoData.planEstudiosClave,
      creditos: alumnoData.creditos,
      tutorAcademico: alumnoData.tutorAcademico,
      ...response.data // Sobrescribir con cualquier dato adicional de la API
    }
    
    console.log('✅ Frontend: Alumno creado exitosamente')
    return newAlumno
  } catch (error) {
    console.error('💥 Frontend: Error al crear alumno:', error)
    throw error
  }
}

// Actualizar alumno
export const updateAlumno = async (id, alumnoData) => {
  try {
    const dataToSend = {
      matricula: alumnoData.matricula,
      nombre: alumnoData.nombre,
      carrera: alumnoData.carrera,
      estatusAlumno: alumnoData.estatusAlumno,
      cuatrimestreActual: alumnoData.cuatrimestreActual,
      grupoActual: alumnoData.grupoActual,
      materia: alumnoData.materia,
      periodo: alumnoData.periodo,
      estatusMateria: alumnoData.estatusMateria,
      final: alumnoData.final,
      extra: alumnoData.extra,
      estatusCardex: alumnoData.estatusCardex,
      periodoCursado: alumnoData.periodoCursado,
      planEstudiosClave: alumnoData.planEstudiosClave,
      creditos: alumnoData.creditos,
      tutorAcademico: alumnoData.tutorAcademico
    }
    
    const response = await axios.put(`${API_BASE_URL}/alumnos/${id}`, dataToSend)
    
    // Construir el objeto completo con todos los campos actualizados
    const updatedAlumno = {
      id: id,
      ...dataToSend,
      ...response.data // Sobrescribir con cualquier dato adicional de la API
    }
    
    return updatedAlumno
  } catch (error) {
    console.error('💥 Frontend: Error al actualizar alumno:', error)
    throw error
  }
}

// Eliminar alumno
export const deleteAlumno = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/alumnos/${id}`)
    return true
  } catch (error) {
    console.error('💥 Frontend: Error al eliminar alumno:', error)
    throw error
  }
}

// Cargar alumnos desde archivo CSV (multipart)
export const uploadAlumnosCSV = async (file, onProgress = null) => {
  try {
    console.log('🔍 Frontend: Iniciando carga de CSV:', file.name)
    
    const formData = new FormData()
    formData.append('archivo', file)
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    }
    
    const response = await axios.post(
      `${API_BASE_URL}/alumnos/cargar-csv`, 
      formData, 
      config
    )
    
    console.log('✅ Frontend: CSV procesado exitosamente:', {
      totalRows: response.data.totalRows,
      successfullyProcessed: response.data.successfullyProcessed,
      errors: response.data.errors
    })
    
    return {
      success: true,
      data: response.data,
      message: `Archivo procesado: ${response.data.successfullyProcessed} de ${response.data.totalRows} registros guardados exitosamente`
    }
  } catch (error) {
    console.error('💥 Frontend: Error al cargar CSV:', error)
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // Error del servidor con respuesta
      return {
        success: false,
        message: error.response.data.message || 'Error al procesar el archivo',
        errors: error.response.data.errors || []
      }
    } else if (error.request) {
      // Error de red
      return {
        success: false,
        message: 'Error de conexión. Verifica que el servidor esté funcionando.'
      }
    } else {
      // Error de configuración
      return {
        success: false,
        message: 'Error inesperado al cargar el archivo.'
      }
    }
  }
}

// Validar formato de archivo CSV
export const validateCSVFile = (file) => {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
    return {
      valid: false,
      message: 'Formato de archivo no válido. Solo se permiten archivos CSV, XLS o XLSX.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
    }
  }
  
  return {
    valid: true,
    message: 'Archivo válido'
  }
}

// Obtener template/plantilla CSV
export const downloadTemplate = () => {
  return new Promise((resolve) => {
    const headers = [
      'Matricula',
      'Nombre',
      'Carrera',
      'EstatusAlumno',
      'CuatrimestreActual',
      'GrupoActual',
      'Materia',
      'Periodo',
      'EstatusMateria',
      'Final',
      'Extra',
      'EstatusCardex',
      'PeriodoCursado',
      'PlanEstudiosClave',
      'Creditos',
      'TutorAcademico'
    ]
    
    // Agregar una fila de ejemplo
    const exampleRow = [
      '223258',
      'Juan Pérez',
      'Ingeniería en Sistemas',
      'Inscrito',
      '5',
      'A',
      'Cálculo Diferencial',
      'ENERO-ABRIL 2024',
      'Cursando',
      '85',
      'N/A',
      'Vigente',
      'ENERO-ABRIL 2024',
      'ISC-2020',
      '8',
      'Dr. María García'
    ]
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(',')
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_alumnos.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    resolve(true)
  })
}

// Exportar datos de alumnos a CSV
export const exportAlumnosToCSV = (alumnos, filename = 'datos_alumnos.csv') => {
  return new Promise((resolve) => {
    const headers = [
      'Matricula',
      'Nombre',
      'Carrera',
      'EstatusAlumno',
      'CuatrimestreActual',
      'GrupoActual',
      'Materia',
      'Periodo',
      'EstatusMateria',
      'Final',
      'Extra',
      'EstatusCardex',
      'PeriodoCursado',
      'PlanEstudiosClave',
      'Creditos',
      'TutorAcademico'
    ]
    
    const csvData = [
      headers.join(','),
      ...alumnos.map(alumno => 
        headers.map(header => {
          const key = header.charAt(0).toLowerCase() + header.slice(1)
          let value = ''
          
          // Mapear campos específicos
          switch (header) {
            case 'Matricula':
              value = alumno.matricula || ''
              break
            case 'Nombre':
              value = alumno.nombre || ''
              break
            case 'Carrera':
              value = alumno.carrera || ''
              break
            case 'EstatusAlumno':
              value = alumno.estatusAlumno || ''
              break
            case 'CuatrimestreActual':
              value = alumno.cuatrimestreActual || ''
              break
            case 'GrupoActual':
              value = alumno.grupoActual || ''
              break
            case 'Materia':
              value = alumno.materia || ''
              break
            case 'Periodo':
              value = alumno.periodo || ''
              break
            case 'EstatusMateria':
              value = alumno.estatusMateria || ''
              break
            case 'Final':
              value = alumno.final || ''
              break
            case 'Extra':
              value = alumno.extra || ''
              break
            case 'EstatusCardex':
              value = alumno.estatusCardex || ''
              break
            case 'PeriodoCursado':
              value = alumno.periodoCursado || ''
              break
            case 'PlanEstudiosClave':
              value = alumno.planEstudiosClave || ''
              break
            case 'Creditos':
              value = alumno.creditos || ''
              break
            case 'TutorAcademico':
              value = alumno.tutorAcademico || ''
              break
            default:
              value = alumno[key] || ''
          }
          
          return `"${value}"`
        }).join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
    resolve(true)
  })
}
