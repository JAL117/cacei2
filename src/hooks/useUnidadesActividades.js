import { useState, useEffect, useMemo } from 'react'
import { 
  createUnidadCompleta,
  getUnidadesByCurso,
  getUnidadesConActividadesByCurso,
  validarUnidadCompleta
} from '../api/unidadesActividades'
import { getMateriasDisponiblesProfesor } from '../api/unidades'

/**
 * Hook personalizado para manejar la lógica de unidades y actividades
 */
export const useUnidadesActividades = () => {
  // Estados para datos del backend
  const [materias, setMaterias] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Obtener ID del profesor desde localStorage
  const profesorId = localStorage.getItem('userID')
  
  // Estados del formulario
  const [editing, setEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterSubj, setFilterSubj] = useState('all')
  const [form, setForm] = useState({
    subject: '',
    numeroUnidad: '',
    name: '',
    description: '',
    activities: [{ name: 'Examen Parcial', description: 'Descripción breve', weight: '' }]
  })

  // Función de utilidad para transformar unidades del backend al formato de UI
  const transformUnidadToUI = (unidad, cursoId) => {
    console.log('🔄 Transformando unidad para UI:', { unidad, cursoId })
    
    return {
      id: unidad.id,
      subject: cursoId, // Usar cursoId como identificador
      numero_unidad: unidad.numero_unidad,
      name: unidad.nombre_unidad,
      description: unidad.descripcion,
      activities: unidad.actividades?.map(actividad => ({
        id: actividad.id,
        name: actividad.nombre_actividad || actividad.nombre,
        description: actividad.descripcion,
        weight: actividad.ponderacion * 100 // Convertir de decimal a porcentaje para la UI
      })) || []
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (profesorId) {
      loadInitialData()
    } else {
      setError('No se encontró el ID del profesor en el sistema')
      setLoading(false)
    }
  }, [profesorId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando datos para profesor:', profesorId)
      
      // Cargar solo las materias disponibles del profesor
      const materiasData = await getMateriasDisponiblesProfesor(profesorId)
      
      console.log('✅ Materias cargadas:', materiasData)
      
      setMaterias(materiasData)
      
      // Si hay materias disponibles, establecer la primera como filtro por defecto
      if (materiasData.length > 0) {
        const primeraMateria = materiasData[0]
        
        console.log('🎯 Configurando materia por defecto:', primeraMateria)
        
        setFilterSubj(primeraMateria.id)
        setForm(prev => ({ 
          ...prev, 
          subject: primeraMateria.id,
          numeroUnidad: 1 
        }))
        
        // Cargar unidades de la primera materia (usar el primer curso de la materia)
        if (primeraMateria.cursos && primeraMateria.cursos.length > 0) {
          const primerCurso = primeraMateria.cursos[0]
          console.log('🎯 Cargando unidades del primer curso:', primerCurso)
          await loadUnidadesByMateria(primerCurso.id)
        } else {
          console.warn('⚠️ La primera materia no tiene cursos asociados:', primeraMateria)
          setUnits([])
        }
      } else {
        console.log('ℹ️ No hay materias disponibles para el profesor')
        setUnits([])
      }
      
    } catch (err) {
      console.error('💥 Error cargando datos iniciales:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUnidadesByMateria = async (cursoId) => {
    try {
      if (!cursoId) {
        console.warn('⚠️ No se proporcionó cursoId para cargar unidades')
        setUnits([])
        return
      }
      
      console.log('🔍 Cargando unidades del curso con actividades:', cursoId)
      
      // Usar el endpoint optimizado que trae unidades con actividades
      const unidadesConActividades = await getUnidadesConActividadesByCurso(cursoId)
      
      console.log('✅ Unidades con actividades cargadas:', unidadesConActividades)
      
      // Transformar los datos usando la función de utilidad
      const unidadesTransformadas = unidadesConActividades.map(unidad => 
        transformUnidadToUI(unidad, cursoId)
      )
      
      console.log('🔄 Unidades transformadas para frontend:', unidadesTransformadas)
      
      setUnits(unidadesTransformadas)
      console.log('✅ Unidades cargadas en estado:', unidadesTransformadas.length)
      
    } catch (err) {
      console.error('💥 Error cargando unidades:', err)
      setUnits([])
    }
  }

  // Crear opciones para el select de materias
  const subjectOptions = useMemo(() => {
    const options = [{ id: 'all', name: 'Todas las asignaturas' }]
    
    materias.forEach(materia => {
      options.push({
        id: materia.id,
        name: `${materia.nombre} - Cuatrimestre ${materia.cuatrimestre}`
      })
    })
    
    return options
  }, [materias])

  // Calcular peso total de actividades (los usuarios ingresan valores ya en porcentaje)
  const totalWeight = useMemo(
    () => form.activities.reduce((sum, a) => sum + Number(a.weight || 0), 0),
    [form.activities]
  )

  // Filtrar unidades por materia seleccionada
  const filteredUnits = useMemo(() => {
    console.log('🔍 Filtrando unidades:', {
      filterSubj,
      totalUnits: units.length,
      units: units
    })
    
    if (filterSubj === 'all') {
      console.log('✅ Mostrando todas las unidades:', units.length)
      return units
    }
    
    // Encontrar la materia seleccionada para obtener su curso_id
    const materiaSeleccionada = materias.find(m => m.id == filterSubj)
    if (!materiaSeleccionada?.cursos?.[0]?.id) {
      console.warn('⚠️ No se encontró curso para la materia seleccionada')
      return []
    }
    
    const cursoId = materiaSeleccionada.cursos[0].id
    const filtered = units.filter(u => u.subject == cursoId)
    
    console.log('✅ Unidades filtradas:', {
      materiaId: filterSubj,
      cursoId,
      filteredCount: filtered.length,
      filtered
    })
    
    return filtered
  }, [filterSubj, units, materias])

  // Obtener el siguiente número de unidad
  const getNextUnitNumber = useMemo(() => {
    if (filterSubj === 'all' || units.length === 0) return 1
    
    // Encontrar la materia seleccionada para obtener su curso_id
    const materiaSeleccionada = materias.find(m => m.id == filterSubj)
    if (!materiaSeleccionada?.cursos?.[0]?.id) {
      return 1
    }
    
    const cursoId = materiaSeleccionada.cursos[0].id
    const unitsForSubject = units.filter(u => u.subject == cursoId)
    const maxNumber = Math.max(...unitsForSubject.map(u => u.numero_unidad || 0), 0)
    
    console.log('📊 Calculando siguiente número de unidad:', {
      materiaId: filterSubj,
      cursoId,
      unitsForSubject: unitsForSubject.length,
      maxNumber,
      nextNumber: maxNumber + 1
    })
    
    return maxNumber + 1
  }, [filterSubj, units, materias])

  const handleFilter = async (newFilter) => {
    console.log('🔄 Cambiando filtro de materia:', { anterior: filterSubj, nuevo: newFilter })
    setFilterSubj(newFilter)
    
    // Cerrar formulario de edición al cambiar filtro
    if (editing && newFilter !== 'all') {
      setEditing(false)
      setEditingId(null)
    }
    
    // Cargar unidades de la nueva materia seleccionada
    if (newFilter !== 'all') {
      const materia = materias.find(m => m.id == newFilter)
      console.log('🔍 Materia seleccionada:', materia)
      
      if (materia?.cursos && materia.cursos.length > 0) {
        const cursoId = materia.cursos[0].id
        console.log('🔄 Cargando unidades para curso:', cursoId)
        await loadUnidadesByMateria(cursoId)
      } else {
        console.warn('⚠️ Materia sin cursos asociados')
        setUnits([])
      }
    } else {
      console.log('📋 Mostrando todas las unidades')
    }
  }

  const openForm = () => {
    const defaultSubject = filterSubj === 'all' ? (materias[0]?.id || '') : filterSubj
    setForm({ 
      subject: defaultSubject,
      numeroUnidad: getNextUnitNumber,
      name: '', 
      description: '',
      activities: [{ name: 'Examen Parcial', description: 'Descripción breve', weight: '' }] 
    })
    setEditing(true)
    setEditingId(null)
  }
  
  const closeForm = () => {
    setEditing(false)
    setEditingId(null)
    setError(null)
  }

  const addActivity = () => {
    setForm(f => ({ 
      ...f, 
      activities: [...f.activities, { name: '', description: '', weight: '' }] 
    }))
  }
  
  const removeActivity = (idx) => {
    setForm(f => ({ 
      ...f, 
      activities: f.activities.filter((_, i) => i !== idx) 
    }))
  }
  
  const changeActivity = (idx, field, val) => {
    setForm(f => ({
      ...f,
      activities: f.activities.map((a, i) => 
        i === idx ? { ...a, [field]: val } : a
      )
    }))
  }

  const saveUnit = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Buscar la materia seleccionada para obtener el curso_id
      const materiaSeleccionada = materias.find(m => m.id == form.subject)
      
      if (!materiaSeleccionada) {
        throw new Error('Materia no encontrada')
      }
      
      if (!materiaSeleccionada.cursos || materiaSeleccionada.cursos.length === 0) {
        throw new Error('No se encontraron cursos para esta materia')
      }
      
      // Usar el primer curso de la materia
      const curso = materiaSeleccionada.cursos[0]
      
      // Preparar datos para la unidad completa
      const unidadCompleta = {
        curso_id: curso.id,
        numero_unidad: parseInt(form.numeroUnidad),
        nombre_unidad: form.name,
        descripcion: form.description,
        actividades: form.activities.map(activity => ({
          nombre: activity.name,
          descripcion: activity.description,
          ponderacion: parseFloat(activity.weight) / 100 // Convertir de porcentaje a decimal
        }))
      }
      
      console.log('💾 Datos a guardar:', unidadCompleta)
      
      // Debug: Mostrar detalles de las ponderaciones
      const totalFormulario = form.activities.reduce((sum, a) => sum + Number(a.weight || 0), 0)
      const totalDecimal = unidadCompleta.actividades.reduce((sum, a) => sum + a.ponderacion, 0)
      
      console.log('🔍 Debug ponderaciones:', {
        actividades_formulario: form.activities.map(a => ({ 
          nombre: a.name, 
          weight_formulario: a.weight,
          weight_numerico: Number(a.weight)
        })),
        total_formulario: totalFormulario,
        actividades_backend: unidadCompleta.actividades.map(a => ({ 
          nombre: a.nombre, 
          ponderacion_decimal: a.ponderacion
        })),
        total_decimal: totalDecimal,
        total_decimal_como_porcentaje: totalDecimal * 100
      })
      
      // Validar datos antes de enviar
      const validacion = validarUnidadCompleta(unidadCompleta)
      if (!validacion.esValido) {
        setError(`Error de validación: ${validacion.primerError}`)
        console.log('❌ Errores de validación:', validacion.errores)
        return
      }
      
      // Crear la unidad completa con todas sus actividades
      const result = await createUnidadCompleta(unidadCompleta)
      
      console.log('✅ Resultado de creación:', result)
      
      // Verificar si hubo errores en las actividades
      if (result.resumen.actividades_fallidas > 0) {
        const actividadesFallidas = result.actividades
          .filter(a => a.error)
          .map(a => `${a.nombre}: ${a.error}`)
          .join('\n')
        
        setError(`Unidad creada, pero algunas actividades fallaron:\n${actividadesFallidas}`)
      }
      
      // Agregar al estado local para mostrar inmediatamente
      const cursoId = curso.id // Reutilizar la variable curso del scope superior
      
      // Crear una unidad simulada con la estructura del backend para transformar
      const unidadBackend = {
        id: result.unidad.id,
        numero_unidad: parseInt(form.numeroUnidad),
        nombre_unidad: form.name,
        descripcion: form.description,
        actividades: form.activities.map(activity => ({
          nombre: activity.name,
          descripcion: activity.description,
          ponderacion: parseFloat(activity.weight || 0) / 100 // Convertir de porcentaje a decimal
        }))
      }
      
      const newUnit = transformUnidadToUI(unidadBackend, cursoId)
      
      console.log('➕ Agregando unidad al estado local:', newUnit)
      
      setUnits(prevUnits => {
        const newUnits = [...prevUnits, newUnit]
        console.log('📝 Estado actualizado de unidades:', newUnits)
        return newUnits
      })
      
      // Limpiar formulario
      setForm({
        subject: filterSubj === 'all' ? (materias[0]?.id || '') : filterSubj,
        numeroUnidad: getNextUnitNumber + 1,
        name: '',
        description: '',
        activities: [{ name: 'Examen Parcial', description: 'Descripción breve', weight: '' }]
      })
      setEditing(false)
      setEditingId(null)
      
      console.log('🎉 Unidad y actividades creadas exitosamente')
      
    } catch (err) {
      console.error('💥 Error guardando unidad:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Función para obtener el nombre de la materia por ID del curso
  const getMateriaName = (cursoId) => {
    console.log('🔍 Buscando materia para curso:', cursoId)
    
    // Buscar la materia que contiene el curso con este ID
    const materia = materias.find(m => 
      m.cursos && m.cursos.some(curso => curso.id == cursoId)
    )
    
    console.log('✅ Materia encontrada:', materia)
    
    return materia ? `${materia.nombre} - Cuatrimestre ${materia.cuatrimestre}` : `Curso ${cursoId} - Materia no encontrada`
  }

  // Debug: Monitorear cambios en unidades y filtros
  useEffect(() => {
    console.log('🔄 Estado actual del hook:', {
      profesorId,
      materiasCount: materias.length,
      materias: materias.map(m => ({ id: m.id, nombre: m.nombre, cursosCount: m.cursos?.length || 0 })),
      unitsCount: units.length,
      units: units.map(u => ({ id: u.id, subject: u.subject, numero_unidad: u.numero_unidad, name: u.name })),
      filterSubj,
      filteredUnitsCount: filteredUnits.length,
      loading,
      editing
    })
  }, [profesorId, materias, units, filterSubj, filteredUnits, loading, editing])

  // Auto-abrir formulario cuando no hay unidades
  useEffect(() => {
    console.log('🔍 Efecto auto-abrir formulario:', {
      unitsLength: units.length,
      editing,
      loading,
      materiasLength: materias.length,
      filteredUnitsLength: filteredUnits.length
    })
    
    if (filteredUnits.length === 0 && !editing && !loading && materias.length > 0) {
      console.log('📖 Auto-abriendo formulario porque no hay unidades filtradas')
      setEditing(true)
    }
  }, [units.length, editing, loading, materias.length, filteredUnits.length])

  return {
    // Estados
    materias,
    units,
    loading,
    error,
    saving,
    editing,
    editingId,
    filterSubj,
    form,
    
    // Valores calculados
    subjectOptions,
    totalWeight,
    filteredUnits,
    getNextUnitNumber,
    
    // Funciones
    setError,
    handleFilter,
    openForm,
    closeForm,
    addActivity,
    removeActivity,
    changeActivity,
    saveUnit,
    getMateriaName,
    setForm,
    loadInitialData,
    // Debug: exponer función para recargar unidades
    reloadUnits: () => {
      if (filterSubj !== 'all') {
        const materia = materias.find(m => m.id == filterSubj)
        if (materia?.cursos?.[0]?.id) {
          loadUnidadesByMateria(materia.cursos[0].id)
        }
      }
    }
  }
}
