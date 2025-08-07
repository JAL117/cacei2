import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Paper,
  Alert,
  Tooltip
} from '@mui/material'
import { Save as SaveIcon, School as SchoolIcon, Person as PersonIcon } from '@mui/icons-material'
import { validateGrade, sanitizeGrade } from '../../../utils/validations'

export default function Calificaciones() {
  // Lista de materias disponibles
  const subjects = useMemo(() => [
    { id: 'calc', name: 'Cálculo Diferencial' },
    { id: 'poo', name: 'Programación Orientada a Objetos' },
    { id: 'db', name: 'Base de Datos' },
    { id: 'net', name: 'Redes de Computadoras' }
  ], [])

  // Hook para obtener las unidades registradas desde localStorage
  const [registeredUnits, setRegisteredUnits] = useState([])

  // Cargar unidades registradas desde localStorage
  useEffect(() => {
    const loadRegisteredUnits = () => {
      try {
        const savedUnits = localStorage.getItem('registeredUnits')
        if (savedUnits) {
          const parsedUnits = JSON.parse(savedUnits)
          setRegisteredUnits(parsedUnits)
        } else {
          const defaultUnits = [
            // POO - 4 unidades
            {
              id: 1,
              subject: 'poo',
              name: 'Unidad 1 - Fundamentos de POO',
              description: 'Introducción a los conceptos básicos de programación orientada a objetos',
              startDate: '2025-07-01',
              endDate: '2025-07-31',
              activities: [
                { name: 'Examen', description: 'Evaluación teórica', weight: '40' },
                { name: 'Proyecto', description: 'Desarrollo de aplicación', weight: '60' }
              ]
            },
            {
              id: 2,
              subject: 'poo',
              name: 'Unidad 2 - Herencia y Polimorfismo',
              description: 'Conceptos avanzados de POO',
              startDate: '2025-08-01',
              endDate: '2025-08-31',
              activities: [
                { name: 'Examen', description: 'Evaluación teórica', weight: '50' },
                { name: 'Práctica', description: 'Ejercicios prácticos', weight: '30' },
                { name: 'Tarea', description: 'Tarea en casa', weight: '20' }
              ]
            },
            {
              id: 3,
              subject: 'poo',
              name: 'Unidad 3 - Interfaces y Clases Abstractas',
              description: 'Abstracción en POO',
              startDate: '2025-09-01',
              endDate: '2025-09-30',
              activities: [
                { name: 'Examen', description: 'Evaluación teórica', weight: '45' },
                { name: 'Proyecto', description: 'Proyecto integrador', weight: '55' }
              ]
            },
            {
              id: 4,
              subject: 'poo',
              name: 'Unidad 4 - Patrones de Diseño',
              description: 'Patrones de diseño en POO',
              startDate: '2025-10-01',
              endDate: '2025-10-31',
              activities: [
                { name: 'Examen', description: 'Evaluación final', weight: '60' },
                { name: 'Portafolio', description: 'Portafolio de evidencias', weight: '40' }
              ]
            },
            // Cálculo - 3 unidades
            {
              id: 5,
              subject: 'calc',
              name: 'Unidad 1 - Límites',
              description: 'Conceptos fundamentales de límites y continuidad',
              startDate: '2025-07-01',
              endDate: '2025-08-15',
              activities: [
                { name: 'Examen', description: 'Evaluación práctica', weight: '70' },
                { name: 'Tareas', description: 'Ejercicios semanales', weight: '30' }
              ]
            },
            {
              id: 6,
              subject: 'calc',
              name: 'Unidad 2 - Derivadas',
              description: 'Cálculo diferencial y aplicaciones',
              startDate: '2025-08-16',
              endDate: '2025-09-30',
              activities: [
                { name: 'Examen', description: 'Evaluación teórica', weight: '60' },
                { name: 'Práctica', description: 'Ejercicios prácticos', weight: '25' },
                { name: 'Quiz', description: 'Quiz semanal', weight: '15' }
              ]
            },
            {
              id: 7,
              subject: 'calc',
              name: 'Unidad 3 - Integrales',
              description: 'Cálculo integral y aplicaciones',
              startDate: '2025-10-01',
              endDate: '2025-11-15',
              activities: [
                { name: 'Examen', description: 'Evaluación final', weight: '80' },
                { name: 'Proyecto', description: 'Proyecto de aplicación', weight: '20' }
              ]
            },
            // Base de Datos - 5 unidades
            {
              id: 8,
              subject: 'db',
              name: 'Unidad 1 - Modelado de datos',
              description: 'Fundamentos del modelado de bases de datos',
              startDate: '2025-07-01',
              endDate: '2025-07-31',
              activities: [
                { name: 'Diagrama ER', description: 'Creación de diagrama entidad-relación', weight: '40' },
                { name: 'Normalización', description: 'Ejercicios de normalización', weight: '30' },
                { name: 'Examen', description: 'Evaluación teórica', weight: '30' }
              ]
            },
            {
              id: 9,
              subject: 'db',
              name: 'Unidad 2 - SQL Básico',
              description: 'Consultas básicas en SQL',
              startDate: '2025-08-01',
              endDate: '2025-08-31',
              activities: [
                { name: 'Práctica', description: 'Ejercicios SQL', weight: '50' },
                { name: 'Examen', description: 'Evaluación práctica', weight: '50' }
              ]
            },
            {
              id: 10,
              subject: 'db',
              name: 'Unidad 3 - SQL Avanzado',
              description: 'Consultas complejas y procedimientos',
              startDate: '2025-09-01',
              endDate: '2025-09-30',
              activities: [
                { name: 'Proyecto', description: 'Proyecto de base de datos', weight: '60' },
                { name: 'Examen', description: 'Evaluación teórica', weight: '40' }
              ]
            },
            {
              id: 11,
              subject: 'db',
              name: 'Unidad 4 - Administración de BD',
              description: 'Administración y optimización',
              startDate: '2025-10-01',
              endDate: '2025-10-31',
              activities: [
                { name: 'Práctica', description: 'Configuración de BD', weight: '30' },
                { name: 'Reporte', description: 'Reporte de optimización', weight: '35' },
                { name: 'Examen', description: 'Evaluación final', weight: '35' }
              ]
            },
            {
              id: 12,
              subject: 'db',
              name: 'Unidad 5 - Seguridad y Respaldos',
              description: 'Seguridad en bases de datos',
              startDate: '2025-11-01',
              endDate: '2025-11-30',
              activities: [
                { name: 'Proyecto', description: 'Implementación de seguridad', weight: '70' },
                { name: 'Examen', description: 'Evaluación final', weight: '30' }
              ]
            },
            // Redes - 2 unidades
            {
              id: 13,
              subject: 'net',
              name: 'Unidad 1 - Modelo OSI',
              description: 'Estudio del modelo OSI y protocolos de red',
              startDate: '2025-07-01',
              endDate: '2025-08-15',
              activities: [
                { name: 'Investigación', description: 'Investigación sobre protocolos', weight: '20' },
                { name: 'Práctica', description: 'Práctica de laboratorio', weight: '40' },
                { name: 'Examen', description: 'Evaluación teórica', weight: '40' }
              ]
            },
            {
              id: 14,
              subject: 'net',
              name: 'Unidad 2 - Configuración de Redes',
              description: 'Configuración y troubleshooting',
              startDate: '2025-08-16',
              endDate: '2025-09-30',
              activities: [
                { name: 'Laboratorio', description: 'Configuración práctica', weight: '60' },
                { name: 'Examen', description: 'Evaluación práctica', weight: '40' }
              ]
            }
          ]
          setRegisteredUnits(defaultUnits)
          localStorage.setItem('registeredUnits', JSON.stringify(defaultUnits))
        }
      } catch (error) {
        console.error('Error loading registered units:', error)
        setRegisteredUnits([])
      }
    }

    loadRegisteredUnits()
  }, [])

  // Obtener unidades dinámicamente basadas en las unidades registradas
  const unitsData = useMemo(() => {
    const grouped = {}
    
    registeredUnits.forEach(unit => {
      if (!grouped[unit.subject]) {
        grouped[unit.subject] = []
      }
      grouped[unit.subject].push({
        id: unit.id,
        name: unit.name,
        description: unit.description,
        startDate: unit.startDate,
        endDate: unit.endDate,
        activities: unit.activities.map(activity => ({
          name: activity.name,
          description: activity.description,
          weight: activity.weight
        }))
      })
    })
    
    // Ordenar las unidades por fecha de inicio
    Object.keys(grouped).forEach(subject => {
      grouped[subject].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    })
    
    return grouped
  }, [registeredUnits])

  // Datos mock de estudiantes
  const studentsData = useMemo(() => [
    { id: 1, matricula: '202401', name: 'Carlos Mendez', grupo: 'A' },
    { id: 2, matricula: '202402', name: 'Laura Jiménez', grupo: 'A' },
    { id: 3, matricula: '202403', name: 'Miguel Torres', grupo: 'A' },
    { id: 4, matricula: '202404', name: 'Ana García', grupo: 'A' },
    { id: 5, matricula: '202405', name: 'Roberto Silva', grupo: 'B' }
  ], [])

  // Estado para la materia seleccionada
  const [selectedSubject, setSelectedSubject] = useState('poo')
  
  // Estado para la unidad seleccionada
  const [selectedUnit, setSelectedUnit] = useState('')
  
  // Estado para las calificaciones de los estudiantes
  const [gradesData, setGradesData] = useState({})
  
  // Estado para las calificaciones calculadas
  const [calculatedGrades, setCalculatedGrades] = useState({})
  
  // Estado para mostrar mensaje de guardado
  const [showSaveMessage, setShowSaveMessage] = useState(false)

  // Cargar calificaciones guardadas desde localStorage
  useEffect(() => {
    const loadSavedGrades = () => {
      try {
        const savedGrades = localStorage.getItem(`grades_${selectedSubject}`)
        if (savedGrades) {
          const parsedGrades = JSON.parse(savedGrades)
          setGradesData(parsedGrades)
        }
      } catch (error) {
        console.error('Error loading saved grades:', error)
      }
    }

    loadSavedGrades()
  }, [selectedSubject])

  // Escuchar cambios en las unidades registradas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'registeredUnits') {
        try {
          const newUnits = JSON.parse(e.newValue || '[]')
          setRegisteredUnits(newUnits)
        } catch (error) {
          console.error('Error parsing updated units:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Unidades filtradas según la materia seleccionada
  const units = useMemo(() => {
    return unitsData[selectedSubject] || []
  }, [selectedSubject, unitsData])

  // Unidad seleccionada para calificar
  const selectedUnitData = useMemo(() => {
    return units.find(unit => unit.id === selectedUnit) || null
  }, [units, selectedUnit])

  // Resetear unidad seleccionada cuando cambia la materia
  useEffect(() => {
    setSelectedUnit('')
  }, [selectedSubject])

  // Seleccionar automáticamente la primera unidad disponible
  useEffect(() => {
    if (units.length > 0 && !selectedUnit) {
      setSelectedUnit(units[0].id)
    }
  }, [units, selectedUnit])

  // Función para inicializar datos de calificaciones si no existen
  useEffect(() => {
    if (selectedUnitData) {
      setGradesData(prev => {
        const newGrades = { ...prev }
        
        studentsData.forEach(student => {
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
  }, [selectedUnitData, studentsData])

  // Calcular calificación final cuando cambian los datos
  useEffect(() => {
    if (!selectedUnitData) return

    const newCalculatedGrades = {}
    
    studentsData.forEach(student => {
      newCalculatedGrades[student.id] = {}
      
      let unitTotal = 0
      let hasInvalidGrade = false
      let totalWeight = 0
      
      selectedUnitData.activities.forEach(activity => {
        const grade = gradesData[student.id]?.[selectedUnitData.id]?.[activity.name]
        const weight = parseFloat(activity.weight) || 0
        
        // Verificar si la calificación es válida
        if (grade === '' || isNaN(grade) || grade < 0 || grade > 100) {
          hasInvalidGrade = true
          return
        }
        
        // Calcular contribución a la calificación
        unitTotal += (parseFloat(grade) * weight) / 100
        totalWeight += weight
      })
      
      // Verificar que los pesos sumen 100%
      if (totalWeight !== 100) {
        console.warn(`Los pesos de las actividades en la unidad ${selectedUnitData.name} no suman 100%`)
      }
      
      // Guardar calificación calculada para esta unidad
      newCalculatedGrades[student.id][selectedUnitData.id] = hasInvalidGrade ? null : Math.round(unitTotal)
    })
    
    setCalculatedGrades(newCalculatedGrades)
  }, [gradesData, selectedUnitData, studentsData])

  // Manejar cambio de calificación
  const handleGradeChange = (studentId, activityName, value) => {
    // Limitar a 3 caracteres
    if (value.length <= 3) {
      setGradesData(prev => ({
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [selectedUnitData.id]: {
            ...(prev[studentId]?.[selectedUnitData.id] || {}),
            [activityName]: value
          }
        }
      }))
    }
  }

  // Validar calificación al perder el foco
  const handleBlur = (studentId, activityName) => {
    setGradesData(prev => {
      const value = prev[studentId]?.[selectedUnitData.id]?.[activityName]
      
      // Si está vacío, dejarlo así
      if (value === '') return prev
      
      // Usar la función de sanitización centralizada
      const sanitizedValue = sanitizeGrade(value)
      
      return {
        ...prev,
        [studentId]: {
          ...(prev[studentId] || {}),
          [unitId]: {
            ...(prev[studentId]?.[unitId] || {}),
            [activityName]: String(sanitizedValue)
          }
        }
      }
    })
  }

  // Guardar calificaciones
  const handleSaveGrades = () => {
    try {
      // Guardar calificaciones en localStorage por materia
      localStorage.setItem(`grades_${selectedSubject}`, JSON.stringify(gradesData))
      
      // También guardar un registro global de todas las calificaciones
      const allGrades = JSON.parse(localStorage.getItem('allGrades') || '{}')
      allGrades[selectedSubject] = gradesData
      localStorage.setItem('allGrades', JSON.stringify(allGrades))
      
      // Mostrar mensaje de éxito
      setShowSaveMessage(true)
      setTimeout(() => setShowSaveMessage(false), 3000)
      
      console.log('Calificaciones guardadas exitosamente para:', selectedSubject)
    } catch (error) {
      console.error('Error saving grades:', error)
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  // Obtener color según la calificación
  const getGradeColor = (grade) => {
    if (grade === null) return 'text.secondary'
    if (grade < 70) return 'error.main'
    if (grade < 80) return 'warning.main'
    if (grade < 90) return 'success.main'
    return 'primary.main'
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Calificaciones</Typography>
          <Typography variant="body1" color="text.secondary">
            Registra y visualiza calificaciones de tus tutorados
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSaveGrades}
          disabled={Object.keys(gradesData).length === 0}
        >
          Guardar Calificaciones
        </Button>
      </Box>

      {/* Mensaje de guardado exitoso */}
      {showSaveMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Las calificaciones han sido guardadas exitosamente.
        </Alert>
      )}

      {/* Selector de asignatura */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Selecciona una Asignatura</Typography>
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            {subjects.map(subject => (
              <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
            ))}
          </Select>
          
          {/* Selector de unidad */}
          {units.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>Selecciona una Unidad</Typography>
              <Select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                fullWidth
                size="small"
                displayEmpty
              >
                {units.map(unit => (
                  <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                ))}
              </Select>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabla de calificaciones */}
      {selectedUnitData ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Matrícula</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estudiante</TableCell>
                
                {selectedUnitData.activities.map(activity => (
                  <TableCell 
                    key={activity.name} 
                    align="center"
                    sx={{ fontWeight: 'bold' }}
                  >
                    <Tooltip title={`${activity.description} (${activity.weight}%)`}>
                      <span>{activity.name}</span>
                    </Tooltip>
                  </TableCell>
                ))}
                
                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Calificación Final
                </TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {studentsData.map(student => (
                <TableRow 
                  key={student.id}
                  sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>{student.matricula}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      {student.name}
                    </Box>
                  </TableCell>
                  
                  {selectedUnitData.activities.map(activity => (
                    <TableCell 
                      key={activity.name} 
                      align="center"
                      sx={{ p: 1 }}
                    >
                      <TextField
                        value={gradesData[student.id]?.[selectedUnitData.id]?.[activity.name] || ''}
                        onChange={(e) => handleGradeChange(student.id, activity.name, e.target.value)}
                        onBlur={() => handleBlur(student.id, activity.name)}
                        inputProps={{ 
                          style: { textAlign: 'center' },
                          maxLength: 3
                        }}
                        size="small"
                        variant="standard"
                        sx={{ width: '60px' }}
                        placeholder="0-100"
                      />
                    </TableCell>
                  ))}
                  
                  <TableCell 
                    align="center"
                    sx={{ 
                      p: 1,
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: getGradeColor(calculatedGrades[student.id]?.[selectedUnitData.id])
                    }}
                  >
                    {calculatedGrades[student.id]?.[selectedUnitData.id] !== null
                      ? calculatedGrades[student.id]?.[selectedUnitData.id]
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ textAlign:'center', py:4 }}>
            <SchoolIcon fontSize="large" color="disabled" />
            <Typography variant="h6" color="text.secondary" sx={{ mt:1, mb:1 }}>
              {units.length === 0 ? 'No hay unidades registradas para esta asignatura' : 'Selecciona una unidad para calificar'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {units.length === 0 
                ? 'Para poder calificar, primero debes registrar unidades en el módulo de "Registrar Unidades"'
                : 'Elige una unidad específica del dropdown superior para comenzar a calificar'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>
              {units.length === 0 && 'Las unidades deben incluir actividades con sus respectivos porcentajes de calificación'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}