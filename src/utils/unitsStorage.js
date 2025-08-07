/**
 * Utilidades para manejar el almacenamiento y sincronización de unidades
 * entre los diferentes módulos del sistema
 */

// Clave para almacenar las unidades en localStorage
const UNITS_STORAGE_KEY = 'registeredUnits'

// Función para cargar unidades desde localStorage
export const loadUnitsFromStorage = () => {
  try {
    const savedUnits = localStorage.getItem(UNITS_STORAGE_KEY)
    if (savedUnits) {
      return JSON.parse(savedUnits)
    }
    return []
  } catch (error) {
    console.error('Error loading units from storage:', error)
    return []
  }
}

// Función para guardar unidades en localStorage
export const saveUnitsToStorage = (units) => {
  try {
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units))
    return true
  } catch (error) {
    console.error('Error saving units to storage:', error)
    return false
  }
}

// Función para obtener unidades agrupadas por materia
export const getUnitsBySubject = (units) => {
  const grouped = {}
  
  units.forEach(unit => {
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
  
  return grouped
}

// Función para agregar una nueva unidad
export const addUnit = (newUnit) => {
  const currentUnits = loadUnitsFromStorage()
  const updatedUnits = [...currentUnits, newUnit]
  return saveUnitsToStorage(updatedUnits)
}

// Función para actualizar una unidad existente
export const updateUnit = (unitId, updatedUnit) => {
  const currentUnits = loadUnitsFromStorage()
  const updatedUnits = currentUnits.map(unit => 
    unit.id === unitId ? { ...updatedUnit, id: unitId } : unit
  )
  return saveUnitsToStorage(updatedUnits)
}

// Función para eliminar una unidad
export const deleteUnit = (unitId) => {
  const currentUnits = loadUnitsFromStorage()
  const updatedUnits = currentUnits.filter(unit => unit.id !== unitId)
  return saveUnitsToStorage(updatedUnits)
}

// Función para obtener unidades por materia específica
export const getUnitsForSubject = (subject) => {
  const units = loadUnitsFromStorage()
  return units.filter(unit => unit.subject === subject)
}

// Función para validar si una unidad está completa
export const validateUnit = (unit) => {
  const errors = []
  
  if (!unit.name || unit.name.trim() === '') {
    errors.push('El nombre de la unidad es requerido')
  }
  
  if (!unit.subject || unit.subject.trim() === '') {
    errors.push('La materia es requerida')
  }
  
  if (!unit.startDate) {
    errors.push('La fecha de inicio es requerida')
  }
  
  if (!unit.endDate) {
    errors.push('La fecha de fin es requerida')
  }
  
  if (unit.startDate && unit.endDate && unit.startDate > unit.endDate) {
    errors.push('La fecha de inicio no puede ser posterior a la fecha de fin')
  }
  
  if (!unit.activities || unit.activities.length === 0) {
    errors.push('Debe haber al menos una actividad')
  }
  
  if (unit.activities && unit.activities.length > 0) {
    const totalWeight = unit.activities.reduce((sum, activity) => sum + Number(activity.weight || 0), 0)
    if (totalWeight !== 100) {
      errors.push('La suma de los porcentajes debe ser 100%')
    }
    
    unit.activities.forEach((activity, index) => {
      if (!activity.name || activity.name.trim() === '') {
        errors.push(`La actividad ${index + 1} debe tener un nombre`)
      }
      
      if (!activity.weight || isNaN(activity.weight) || Number(activity.weight) <= 0) {
        errors.push(`La actividad ${index + 1} debe tener un porcentaje válido`)
      }
    })
  }
  
  return errors
}

// Función para obtener estadísticas de unidades
export const getUnitsStats = () => {
  const units = loadUnitsFromStorage()
  const stats = {}
  
  units.forEach(unit => {
    if (!stats[unit.subject]) {
      stats[unit.subject] = {
        count: 0,
        totalActivities: 0,
        subjects: []
      }
    }
    
    stats[unit.subject].count++
    stats[unit.subject].totalActivities += unit.activities.length
  })
  
  return stats
}

// Función para crear unidades de ejemplo si no existen
export const createDefaultUnits = () => {
  const defaultUnits = [
    {
      id: 1,
      subject: 'poo',
      name: 'Unidad 1 - Fundamentos de POO',
      description: 'Introducción a los conceptos básicos de programación orientada a objetos',
      startDate: '2025-07-01',
      endDate: '2025-07-31',
      activities: [
        { name: 'Examen Parcial', description: 'Evaluación teórica', weight: '40' },
        { name: 'Proyecto Final', description: 'Desarrollo de aplicación', weight: '60' }
      ]
    },
    {
      id: 2,
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
      id: 3,
      subject: 'db',
      name: 'Unidad 1 - Modelado de datos',
      description: 'Fundamentos del modelado de bases de datos',
      startDate: '2025-07-01',
      endDate: '2025-08-15',
      activities: [
        { name: 'Diagrama ER', description: 'Creación de diagrama entidad-relación', weight: '40' },
        { name: 'Normalización', description: 'Ejercicios de normalización', weight: '30' },
        { name: 'Examen', description: 'Evaluación teórica', weight: '30' }
      ]
    },
    {
      id: 4,
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
    }
  ]
  
  saveUnitsToStorage(defaultUnits)
  return defaultUnits
}
