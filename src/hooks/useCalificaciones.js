import { useState, useEffect, useMemo } from 'react'
import { getMateriasDisponiblesProfesor } from '../api/unidades'
import { getUnidadesConActividadesByCurso } from '../api/unidadesActividades'

/**
 * Hook personalizado para manejar la lógica de calificaciones
 */
export const useCalificaciones = () => {
  // Estados para datos del backend
  const [materias, setMaterias] = useState([])
  const [units, setUnits] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Obtener ID del profesor desde localStorage
  const profesorId = localStorage.getItem('userID')
  
  // Estados para UI
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [gradesData, setGradesData] = useState({})
  const [calculatedGrades, setCalculatedGrades] = useState({})
  const [showSaveMessage, setShowSaveMessage] = useState(false)
  const [gradeErrors, setGradeErrors] = useState({})

  // Función de utilidad para transformar unidades del backend al formato de calificaciones
  const transformUnidadForGrades = (unidad) => {
    console.log('🔄 Transformando unidad para calificaciones:', unidad)
    
    const transformed = {
      id: unidad.id,
      name: `Unidad ${unidad.numero_unidad}: ${unidad.nombre_unidad}`,
      description: unidad.descripcion,
      activities: unidad.actividades?.map(actividad => {
        console.log('🔍 Transformando actividad original:', actividad)
        
        const rawWeight = parseFloat(actividad.ponderacion)
        
        // Los datos de la BD siempre vienen como decimal (0.3, 0.4, etc.)
        // Solo necesitamos convertir para mostrar en la UI
        const weightForDisplay = rawWeight * 100     // Para mostrar: 0.3 → 30%
        const weightForCalculation = rawWeight       // Para calcular: mantener 0.3
        
        const transformedActivity = {
          id: actividad.id,
          name: actividad.nombre_actividad || actividad.nombre || 'Actividad sin nombre',
          description: actividad.descripcion || '',
          weight: weightForDisplay,              // Para mostrar en UI (30, 40, etc.)
          weightForCalc: weightForCalculation   // Para usar en cálculos (0.3, 0.4, etc.)
        }
        
        console.log('✅ Actividad transformada:', {
          originalWeight: actividad.ponderacion,
          displayWeight: weightForDisplay + '%',
          calcWeight: weightForCalculation,
          activity: transformedActivity
        })
        
        return transformedActivity
      }) || []
    }
    
    console.log('✅ Unidad transformada completa:', transformed)
    return transformed
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
      
      console.log('🔄 Cargando datos de calificaciones para profesor:', profesorId)
      
      // Cargar materias del profesor
      const materiasData = await getMateriasDisponiblesProfesor(profesorId)
      
      console.log('✅ Materias cargadas para calificaciones:', materiasData)
      
      setMaterias(materiasData)
      
      // Si hay materias, establecer la primera como seleccionada
      if (materiasData.length > 0) {
        const primeraMateria = materiasData[0]
        setSelectedSubject(primeraMateria.id)
        
        // Cargar unidades de la primera materia
        if (primeraMateria.cursos && primeraMateria.cursos.length > 0) {
          await loadUnidadesByMateria(primeraMateria.cursos[0].id)
        }
      }
      
      // TODO: Cargar estudiantes reales desde API
      // Por ahora mantener datos mock
      const estudiantesMock = [
        { id: 1, matricula: '202401', name: 'Carlos Mendez', grupo: 'A' },
        { id: 2, matricula: '202402', name: 'Laura Jiménez', grupo: 'A' },
        { id: 3, matricula: '202403', name: 'Miguel Torres', grupo: 'A' },
        { id: 4, matricula: '202404', name: 'Ana García', grupo: 'A' },
        { id: 5, matricula: '202405', name: 'Roberto Silva', grupo: 'B' }
      ]
      
      setEstudiantes(estudiantesMock)
      
    } catch (err) {
      console.error('💥 Error cargando datos de calificaciones:', err)
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
      
      console.log('🔍 Cargando unidades para calificaciones del curso:', cursoId)
      
      // Usar el endpoint optimizado que trae unidades con actividades
      const unidadesConActividades = await getUnidadesConActividadesByCurso(cursoId)
      
      console.log('✅ Unidades con actividades cargadas:', unidadesConActividades)
      
      // Transformar para el formato de calificaciones
      const unidadesTransformadas = unidadesConActividades.map(transformUnidadForGrades)
      
      console.log('🔄 Unidades transformadas para calificaciones:', unidadesTransformadas)
      console.log('🔍 Debug actividades:', unidadesTransformadas.map(u => ({
        unidad: u.name,
        actividades: u.activities.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          weight: a.weight
        }))
      })))
      
      setUnits(unidadesTransformadas)
      
      // Seleccionar la primera unidad automáticamente
      if (unidadesTransformadas.length > 0) {
        setSelectedUnit(unidadesTransformadas[0].id)
      }
      
    } catch (err) {
      console.error('💥 Error cargando unidades para calificaciones:', err)
      setUnits([])
    }
  }

  // Crear opciones para el select de materias
  const subjectOptions = useMemo(() => {
    return materias.map(materia => ({
      id: materia.id,
      name: `${materia.nombre} - Cuatrimestre ${materia.cuatrimestre}`
    }))
  }, [materias])

  // Unidad seleccionada
  const selectedUnitData = useMemo(() => {
    return units.find(unit => unit.id === selectedUnit) || null
  }, [units, selectedUnit])

  // Manejar cambio de materia
  const handleSubjectChange = async (newSubjectId) => {
    setSelectedSubject(newSubjectId)
    setSelectedUnit('')
    setUnits([])
    
    // Cargar unidades de la nueva materia
    const materia = materias.find(m => m.id == newSubjectId)
    if (materia?.cursos && materia.cursos.length > 0) {
      await loadUnidadesByMateria(materia.cursos[0].id)
    }
  }

  // Cargar calificaciones guardadas
  useEffect(() => {
    const loadSavedGrades = () => {
      try {
        const savedGrades = localStorage.getItem(`grades_${selectedSubject}`)
        if (savedGrades) {
          const parsedGrades = JSON.parse(savedGrades)
          setGradesData(parsedGrades)
        } else {
          setGradesData({})
        }
      } catch (error) {
        console.error('Error loading saved grades:', error)
        setGradesData({})
      }
    }

    if (selectedSubject) {
      loadSavedGrades()
    }
  }, [selectedSubject])

  // Inicializar datos de calificaciones
  useEffect(() => {
    if (selectedUnitData && estudiantes.length > 0) {
      setGradesData(prev => {
        const newGrades = { ...prev }
        
        estudiantes.forEach(student => {
          newGrades[student.id] = newGrades[student.id] || {}
          newGrades[student.id][selectedUnitData.id] = newGrades[student.id][selectedUnitData.id] || {}
          
          selectedUnitData.activities.forEach(activity => {
            if (newGrades[student.id][selectedUnitData.id][activity.name] === undefined) {
              newGrades[student.id][selectedUnitData.id][activity.name] = ''
            }
          })
        })
        
        return newGrades
      })
    }
  }, [selectedUnitData, estudiantes])

  // Calcular calificaciones finales
  useEffect(() => {
    if (!selectedUnitData) return

    console.log('🧮 Iniciando cálculo de calificaciones finales...')
    console.log('📊 Datos de entrada:', {
      selectedUnitData,
      gradesData,
      estudiantes: estudiantes.length
    })

    const newCalculatedGrades = {}
    
    estudiantes.forEach(student => {
      console.log(`\n👨‍🎓 Calculando para estudiante: ${student.name} (ID: ${student.id})`)
      
      newCalculatedGrades[student.id] = {}
      
      let unitTotal = 0
      let hasInvalidGrade = false
      let totalWeight = 0
      let calculationDetails = []
      
      selectedUnitData.activities.forEach(activity => {
        const grade = gradesData[student.id]?.[selectedUnitData.id]?.[activity.name]
        const weightForDisplay = parseFloat(activity.weight) || 0      // Para mostrar (30, 40, etc.)
        const weightForCalc = parseFloat(activity.weightForCalc) || 0  // Para calcular (0.3, 0.4, etc.)
        
        console.log(`📝 Procesando actividad: ${activity.name}`)
        console.log(`   - Calificación ingresada: "${grade}" (tipo: ${typeof grade})`)
        console.log(`   - Peso para mostrar: ${weightForDisplay}% (tipo: ${typeof weightForDisplay})`)
        console.log(`   - Peso para cálculo: ${weightForCalc} (tipo: ${typeof weightForCalc})`)
        
        if (grade === '' || grade === undefined || grade === null) {
          console.log(`   - ❌ Calificación faltante - marcando como inválida`)
          hasInvalidGrade = true
          return
        }
        
        const numericGrade = parseFloat(grade)
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
          console.log(`   - ❌ Calificación inválida: ${numericGrade} - marcando como inválida`)
          hasInvalidGrade = true
          return
        }
        
        // Usar el peso para cálculo (ya en formato decimal 0.3, 0.4, etc.)
        // Ejemplo: 85 × 0.4 = 34 puntos
        const contribution = numericGrade * weightForCalc
        unitTotal += contribution
        totalWeight += weightForDisplay  // Para verificación, usar el peso en porcentaje
        
        calculationDetails.push({
          actividad: activity.name,
          calificacion: numericGrade,
          pesoDisplay: weightForDisplay,
          pesoCalc: weightForCalc,
          contribucion: contribution
        })
        
        console.log(`   - ✅ Contribución: ${numericGrade} × ${weightForCalc} = ${contribution.toFixed(2)} puntos`)
      })
      
      const finalGrade = hasInvalidGrade ? null : Math.round(unitTotal)
      
      console.log(`🎯 Resultado para ${student.name}:`)
      console.log(`   - Detalles de cálculo:`, calculationDetails)
      console.log(`   - Total antes de redondear: ${unitTotal.toFixed(2)}`)
      console.log(`   - Peso total verificado: ${totalWeight}%`)
      console.log(`   - Calificación final: ${finalGrade}`)
      console.log(`   - Tiene calificaciones válidas: ${!hasInvalidGrade}`)
      
      newCalculatedGrades[student.id][selectedUnitData.id] = finalGrade
    })
    
    console.log('✅ Cálculo de calificaciones completado:', newCalculatedGrades)
    setCalculatedGrades(newCalculatedGrades)
  }, [gradesData, selectedUnitData, estudiantes])

  // Validación simple de calificaciones
  const validateGrade = (value) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 'Debe ser un número válido'
    if (num < 0) return 'No puede ser negativo'
    if (num > 100) return 'No puede ser mayor a 100'
    return null
  }

  // Sanitizar calificación
  const sanitizeGrade = (value) => {
    const num = parseFloat(value)
    if (isNaN(num)) return 0
    return Math.max(0, Math.min(100, num))
  }

  // Manejar cambio de calificación
  const handleGradeChange = (studentId, activityName, value) => {
    console.log('📝 Cambio de calificación detectado:', {
      studentId,
      activityName,
      value,
      valueType: typeof value,
      valueLength: value.length
    })
    
    if (value.length <= 3) {
      const errorKey = `${studentId}_${selectedUnitData.id}_${activityName}`
      const validationError = value.trim() !== '' ? validateGrade(value) : null
      
      // Limpiar el valor para que solo contenga números y punto decimal
      const sanitizedValue = value.replace(/[^0-9.]/g, '')
      
      console.log('💾 Guardando calificación:', {
        original: value,
        sanitized: sanitizedValue,
        error: validationError
      })
      
      setGradeErrors(prev => ({
        ...prev,
        [errorKey]: validationError
      }))
      
      setGradesData(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [selectedUnitData.id]: {
            ...(prev[studentId]?.[selectedUnitData.id] || {}),
            [activityName]: sanitizedValue
          }
        }
      }))
    }
  }

  // Manejar blur en campo de calificación
  const handleBlur = (studentId, activityName) => {
    const errorKey = `${studentId}_${selectedUnitData.id}_${activityName}`
    
    setGradesData(prev => {
      const value = prev[studentId]?.[selectedUnitData.id]?.[activityName]
      
      if (value === '') {
        setGradeErrors(prevErrors => ({
          ...prevErrors,
          [errorKey]: null
        }))
        return prev
      }
      
      const sanitizedValue = sanitizeGrade(value)
      
      setGradeErrors(prevErrors => ({
        ...prevErrors,
        [errorKey]: null
      }))
      
      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [selectedUnitData.id]: {
            ...(prev[studentId]?.[selectedUnitData.id] || {}),
            [activityName]: String(sanitizedValue)
          }
        }
      }
    })
  }

  // Guardar calificaciones
  const handleSaveGrades = () => {
    try {
      localStorage.setItem(`grades_${selectedSubject}`, JSON.stringify(gradesData))
      
      const allGrades = JSON.parse(localStorage.getItem('allGrades') || '{}')
      allGrades[selectedSubject] = gradesData
      localStorage.setItem('allGrades', JSON.stringify(allGrades))
      
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
      
      console.log('✅ Calificaciones guardadas exitosamente para:', selectedSubject)
    } catch (error) {
      console.error('💥 Error saving grades:', error)
    }
  }

  // Función para obtener el nombre de la materia por ID
  const getMateriaName = (materiaId) => {
    const materia = materias.find(m => m.id == materiaId)
    return materia ? `${materia.nombre} - Cuatrimestre ${materia.cuatrimestre}` : 'Materia no encontrada'
  }

  // Obtener color según la calificación
  const getGradeColor = (grade) => {
    if (grade === null) return 'text.secondary'
    if (grade < 70) return 'error.main'
    if (grade < 80) return 'warning.main'
    if (grade < 90) return 'success.main'
    return 'primary.main'
  }

  return {
    // Estados
    materias,
    units,
    estudiantes,
    loading,
    error,
    selectedSubject,
    selectedUnit,
    gradesData,
    calculatedGrades,
    showSaveMessage,
    gradeErrors,
    
    // Valores calculados
    subjectOptions,
    selectedUnitData,
    
    // Funciones
    setError,
    setSelectedUnit,
    handleSubjectChange,
    handleGradeChange,
    handleBlur,
    handleSaveGrades,
    getMateriaName,
    getGradeColor,
    loadInitialData
  }
}
