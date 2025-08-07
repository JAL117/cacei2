import axios from 'axios'
import { getPersonal } from './personal.js'

const API_BASE_URL = 'http://localhost:3002'

/**
 * Obtener todas las materias
 */
export const getMaterias = async () => {
  try {
    console.log('🔍 Frontend: Solicitando materias desde:', `${API_BASE_URL}/materias/listar`)
    
    const response = await axios.get(`${API_BASE_URL}/api/materias/listar`)
    
    console.log('📊 Frontend: Respuesta de materias:', {
      status: response.status,
      dataLength: response.data?.data ? response.data.data.length : 0,
      message: response.data?.message
    })
    
    // Verificar si la respuesta tiene la estructura esperada
    if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
      console.log('✅ Frontend: Materias obtenidas exitosamente:', response.data.data.length)
      return response.data.data
    }
    
    // Fallback para otras estructuras de respuesta
    if (Array.isArray(response.data)) {
      console.log('✅ Frontend: Materias obtenidas (array directo):', response.data.length)
      return response.data
    }
    
    // Si no hay datos, retornar array vacío
    console.log('ℹ️ Frontend: No se encontraron materias')
    return []
    
  } catch (error) {
    console.error('💥 Frontend: Error al obtener materias:', error)
    
    // Verificar si es un error 404 con mensaje específico
    if (error.response && error.response.status === 404) {
      console.log('ℹ️ Frontend: Error 404 - No hay materias registradas')
      return []
    }
    
    return []
  }
}

/**
 * Obtener lista de docentes activos
 */
export const getDocentesActivos = async () => {
  try {
    console.log('🔍 Frontend: Obteniendo lista de docentes activos...')
    
    const personal = await getPersonal()
    
    if (!Array.isArray(personal)) {
      console.log('ℹ️ Frontend: No hay personal disponible')
      return []
    }
    
    // Filtrar solo docentes activos
    const docentesActivos = personal.filter(person => 
      // Verificar estado activo
      (person.estado === 'Activo' || person.estado === true)
    )
    
    console.log(`✅ Frontend: ${docentesActivos.length} docentes activos encontrados`)
    return docentesActivos
    
  } catch (error) {
    console.error('💥 Frontend: Error al obtener docentes activos:', error)
    return []
  }
}

/**
 * Función de debug para probar endpoints de asignaturas
 */
export const debugAsignaturas = async (asignaturaIds = []) => {
  console.log('🔍 DEBUG: Probando diferentes endpoints para asignaturas...')
  
  const testIds = asignaturaIds.length > 0 ? asignaturaIds : [1, 2, 3] // IDs de prueba
  
  // Test 1: Búsqueda múltiple (recomendado)
  try {
    console.log('🧪 Test 1: POST /api/materias/buscar-multiple')
    const response1 = await axios.post(`${API_BASE_URL}/api/materias/buscar-multiple`, {
      asignatura_ids: testIds
    })
    console.log('✅ Test 1 exitoso:', response1.data)
  } catch (error) {
    console.log('❌ Test 1 falló:', error.response?.data || error.message)
  }
  
  // Test 2: Búsqueda individual actual
  try {
    console.log('🧪 Test 2: POST /materias/buscar (endpoint actual)')
    const response2 = await axios.post(`${API_BASE_URL}/materias/buscar`, {
      asignatura_id: testIds[0]
    })
    console.log('✅ Test 2 exitoso:', response2.data)
  } catch (error) {
    console.log('❌ Test 2 falló:', error.response?.data || error.message)
  }
  
  // Test 3: GET simple
  try {
    console.log('🧪 Test 3: GET /api/materias/:id')
    const response3 = await axios.get(`${API_BASE_URL}/api/materias/${testIds[0]}`)
    console.log('✅ Test 3 exitoso:', response3.data)
  } catch (error) {
    console.log('❌ Test 3 falló:', error.response?.data || error.message)
  }
  
  // Test 4: Listar todas y filtrar
  try {
    console.log('🧪 Test 4: GET /api/materias/listar y filtrar')
    const response4 = await axios.get(`${API_BASE_URL}/api/materias/listar`)
    console.log('✅ Test 4 exitoso:', response4.data)
    
    if (response4.data && Array.isArray(response4.data.data)) {
      const filtered = response4.data.data.filter(m => testIds.includes(m.id))
      console.log('🔍 Materias filtradas:', filtered)
    }
  } catch (error) {
    console.log('❌ Test 4 falló:', error.response?.data || error.message)
  }
  
  // Test 5: Endpoint alternativo
  try {
    console.log('🧪 Test 5: POST /api/asignaturas/buscar')
    const response5 = await axios.post(`${API_BASE_URL}/api/asignaturas/buscar`, {
      ids: testIds
    })
    console.log('✅ Test 5 exitoso:', response5.data)
  } catch (error) {
    console.log('❌ Test 5 falló:', error.response?.data || error.message)
  }
}

/**
 * Obtener materias con relaciones completas desde múltiples endpoints
 */
export const getMateriasWithRelaciones = async () => {
  try {
    console.log('🔍 Frontend: Obteniendo materias con relaciones completas...')
    
    // PASO 1: Obtener todas las relaciones desde el puerto 3003
    console.log('📡 Paso 1: Obteniendo relaciones curso/grupos/profesores...')
    const relacionesResponse = await axios.get('http://localhost:3003/curso/cursos')
    
    console.log('✅ Relaciones obtenidas:', relacionesResponse.data)
    
    // Verificar la estructura de respuesta correcta
    let relaciones = []
    if (relacionesResponse.data && relacionesResponse.data.success === true && Array.isArray(relacionesResponse.data.data)) {
      relaciones = relacionesResponse.data.data
      console.log('✅ Relaciones extraídas correctamente:', relaciones.length)
    } else if (Array.isArray(relacionesResponse.data)) {
      relaciones = relacionesResponse.data
      console.log('✅ Relaciones obtenidas (array directo):', relaciones.length)
    } else {
      console.log('ℹ️ Frontend: No hay relaciones disponibles o estructura incorrecta')
      return []
    }
    
    if (relaciones.length === 0) {
      console.log('ℹ️ Frontend: No hay relaciones en los datos')
      return []
    }
    
    // PASO 2: Obtener información de asignaturas únicas
    console.log('📡 Paso 2: Obteniendo información de asignaturas...')
    const asignaturasUnicas = [...new Set(relaciones.map(rel => rel.asignatura_id))]
    
    console.log('🔍 Asignaturas únicas encontradas:', asignaturasUnicas)
    
    // Opción A: Buscar múltiples asignaturas en una sola petición (RECOMENDADO)
    let asignaturas = []
    try {
      console.log('📤 Buscando múltiples asignaturas en una petición...')
      const busquedaResponse = await axios.post(`${API_BASE_URL}/api/materias/buscar-multiple`, {
        asignatura_ids: asignaturasUnicas
      })
      
      console.log('✅ Respuesta de búsqueda múltiple:', busquedaResponse.data)
      
      if (busquedaResponse.data && busquedaResponse.data.success && Array.isArray(busquedaResponse.data.data)) {
        asignaturas = busquedaResponse.data.data
        console.log(`✅ ${asignaturas.length} asignaturas obtenidas exitosamente`)
      } else {
        console.log('⚠️ Estructura de respuesta inesperada, intentando fallback...')
        throw new Error('Estructura de respuesta no válida')
      }
      
    } catch (error) {
      console.error('💥 Error en búsqueda múltiple, intentando búsqueda individual:', error)
      
      // FALLBACK: Buscar una por una si falla la búsqueda múltiple
      const asignaturasPromises = asignaturasUnicas.map(async (asignaturaId) => {
        try {
          // Intentar con el endpoint individual actual
          const busquedaResponse = await axios.post(`${API_BASE_URL}/materias/buscar`, {
            asignatura_id: asignaturaId
          })
          
          console.log(`✅ Información de asignatura ${asignaturaId}:`, busquedaResponse.data)
          
          return {
            id: asignaturaId,
            ...busquedaResponse.data.data
          }
        } catch (error) {
          console.error(`💥 Error al buscar asignatura ${asignaturaId}:`, error)
          
          // Intentar con GET simple
          try {
            const getResponse = await axios.get(`${API_BASE_URL}/api/materias/${asignaturaId}`)
            console.log(`✅ Asignatura ${asignaturaId} obtenida por GET:`, getResponse.data)
            
            return {
              id: asignaturaId,
              ...(getResponse.data.data || getResponse.data)
            }
          } catch (getError) {
            console.error(`💥 Error también en GET para asignatura ${asignaturaId}:`, getError)
            return {
              id: asignaturaId,
              nombre: `Asignatura ID ${asignaturaId} (no encontrada)`,
              cuatrimestre: 0
            }
          }
        }
      })
      
      asignaturas = await Promise.all(asignaturasPromises)
    }
    
    console.log('✅ Todas las asignaturas obtenidas:', asignaturas)
    
    // PASO 3: Obtener información del personal para los profesores
    console.log('📡 Paso 3: Obteniendo información del personal...')
    const personal = await getPersonal()
    
    // Crear mapa de profesores por ID
    const profesoresMap = new Map()
    personal.forEach(persona => {
      if (persona.id) {
        profesoresMap.set(persona.id, persona)
      }
    })
    
    // PASO 4: Crear estructura final combinando toda la información
    console.log('🔧 Paso 4: Construyendo estructura final...')
    const materiasCompletas = asignaturas.map(asignatura => {
      // Obtener todas las relaciones para esta asignatura
      const relacionesAsignatura = relaciones.filter(rel => rel.asignatura_id === asignatura.id)
      
      // Agrupar por grupo_id
      const gruposMap = new Map()
      relacionesAsignatura.forEach(relacion => {
        if (!gruposMap.has(relacion.grupo_id)) {
          gruposMap.set(relacion.grupo_id, {
            id: relacion.grupo_id,
            numero: relacion.grupo_numero || gruposMap.size + 1, // Usar numero del grupo o fallback
            profesor_id: relacion.profesor_usuario_id,
            profesor: profesoresMap.get(relacion.profesor_usuario_id) || {
              id: relacion.profesor_usuario_id,
              nombre: 'Profesor no encontrado',
              email: ''
            }
          })
        }
      })
      
      return {
        id: asignatura.id,
        nombre: asignatura.nombre,
        cuatrimestre: asignatura.cuatrimestre,
        grupos: Array.from(gruposMap.values())
      }
    })
    
    console.log('🎉 Frontend: Materias completas construidas:', materiasCompletas.length)
    console.log('📊 Detalle de materias:', materiasCompletas)
    
    return materiasCompletas
    
  } catch (error) {
    console.error('💥 Frontend: Error al obtener materias con relaciones:', error)
    
    // Log detallado del error
    if (error.response) {
      console.error('Error de respuesta:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config?.url
      })
    }
    
    return []
  }
}

/**
 * Crear nueva materia
 */
export const createMateria = async (materiaData) => {
  try {
    console.log('📤 Frontend: Creando materia con datos:', {
      nombre: materiaData.nombre,
      num_cuatri: materiaData.cuatrimestre,
      gruposCount: materiaData.grupos.length,
      grupos: materiaData.grupos.map(g => ({
        numero: g.numero,
        profesor: g.profesor.id || g.profesor
      }))
    })
    
    // PASO 1: Crear la asignatura en el puerto localhost:3002
    console.log('🔍 Paso 1: Creando asignatura...')
    const asignaturaData = {
      nombre: materiaData.nombre,
      num_cuatri: materiaData.cuatrimestre
    }
    
    const asignaturaResponse = await axios.post(`${API_BASE_URL}/api/asignaturas`, asignaturaData)
    console.log('✅ Paso 1 completado - Asignatura creada:', asignaturaResponse.data)
    
    const asignaturaId = asignaturaResponse.data.data.id
    
    // PASO 2: Crear los grupos en la base de datos
    console.log('🔍 Paso 2: Creando grupos...')
    const gruposData = {
      num_cuatri: materiaData.cuatrimestre,
      grupos: materiaData.grupos.map(grupo => ({
        numero: grupo.numero,
        profesorId: grupo.profesor.id || grupo.profesor,
      }))
    }
    
    const gruposResponse = await axios.post(`${API_BASE_URL}/api/grupos`, gruposData)
    console.log('✅ Paso 2 completado - Grupos creados:', gruposResponse.data)
    
    // PASO 3: Crear cursos en el puerto 3003 (una solicitud por cada grupo)
    console.log('🔍 Paso 3: Creando cursos para cada grupo...')
    const cursosPromises = materiaData.grupos.map(async (grupo, index) => {
      const cursoData = {
        asignatura_id: asignaturaId,
        grupo_id: gruposResponse.data.data ? gruposResponse.data.data[index]?.id : index + 1, // Usar ID del grupo o fallback
        profesor_usuario_id: grupo.profesor.id || grupo.profesor
      }
      
      console.log(`📤 Creando curso para grupo ${grupo.numero}:`, cursoData)
      
      const cursoResponse = await axios.post('http://localhost:3003/curso/cursos', cursoData)
      console.log(`✅ Curso creado para grupo ${grupo.numero}:`, cursoResponse.data)
      
      return cursoResponse.data
    })
    
    const cursosResults = await Promise.all(cursosPromises)
    console.log('✅ Paso 3 completado - Todos los cursos creados:', cursosResults)
    
    // Retornar la información completa
    const result = {
      asignatura: asignaturaResponse.data,
      grupos: gruposResponse.data,
      cursos: cursosResults,
      success: true,
      message: 'Materia, grupos y cursos creados exitosamente'
    }
    
    console.log('🎉 Frontend: Materia creada exitosamente con todos los componentes:', result)
    return result
    
  } catch (error) {
    console.error('💥 Frontend: Error al crear materia:', error)
    
    // Log más detallado del error
    if (error.response) {
      console.error('Error de respuesta:', {
        status: error.response.status,
        data: error.response.data,
        url: error.response.config?.url
      })
    }
    
    throw error
  }
}

/**
 * Actualizar materia existente
 */
export const updateMateria = async (id, materiaData) => {
  try {
    console.log('📤 Frontend: Actualizando materia:', {
      id,
      nombre: materiaData.nombre,
      num_cuatri: materiaData.cuatrimestre,
      gruposCount: materiaData.grupos.length
    })
    
    const dataToSend = {
      nombre: materiaData.nombre,
      num_cuatri: materiaData.cuatrimestre,
      grupos: materiaData.grupos.map(grupo => ({
        numero: grupo.numero,
        profesorId: grupo.profesor.id || grupo.profesor,
      }))
    }
    
    const response = await axios.put(`${API_BASE_URL}/materias/${id}`, dataToSend)
    
    console.log('✅ Frontend: Materia actualizada exitosamente:', response.data)
    return response.data
    
  } catch (error) {
    console.error('💥 Frontend: Error al actualizar materia:', error)
    throw error
  }
}

/**
 * Eliminar materia
 */
export const deleteMateria = async (id) => {
  try {
    console.log('🗑️ Frontend: Eliminando materia:', id)
    
    await axios.delete(`${API_BASE_URL}/materias/${id}`)
    
    console.log('✅ Frontend: Materia eliminada exitosamente')
    return true
    
  } catch (error) {
    console.error('💥 Frontend: Error al eliminar materia:', error)
    throw error
  }
}
