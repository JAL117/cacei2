# 📚 Sistema de Validaciones KairoLink

Este archivo contiene todas las validaciones centralizadas para el sistema educativo KairoLink. Incluye validaciones específicas para el ámbito académico y administrativo.

## 🎯 Tipos de Validaciones Implementadas

### 1. **Validaciones de Rango**

#### `validateGrade(value)` - Calificaciones (0-100)
- **Uso**: Validar calificaciones de estudiantes
- **Rango**: 0 a 100 puntos
- **Ejemplo**: 
```javascript
import { validateGrade } from '../utils/validations'

const error = validateGrade(85) // null (válido)
const error = validateGrade(105) // "La calificación no puede ser mayor a 100"
```

#### `validateActivityWeight(value)` - Porcentajes de Actividades (1-100%)
- **Uso**: Validar ponderación de actividades de evaluación
- **Rango**: 1% a 100%
- **Ejemplo**:
```javascript
const error = validateActivityWeight(30) // null (válido)
const error = validateActivityWeight(0) // "El porcentaje mínimo es 1%"
```

#### `validateCredits(value)` - Créditos Académicos (1-12)
- **Uso**: Validar créditos de materias
- **Rango**: 1 a 12 créditos
- **Ejemplo**:
```javascript
const error = validateCredits(6) // null (válido)
const error = validateCredits(15) // "Los créditos máximos son 12"
```

#### `validateWeeklyHours(value)` - Horas Semanales (1-40)
- **Uso**: Validar horas académicas por semana
- **Rango**: 1 a 40 horas
- **Ejemplo**:
```javascript
const error = validateWeeklyHours(4) // null (válido)
const error = validateWeeklyHours(50) // "Las horas máximas son 40 por semana"
```

#### `validateStudentAge(value)` - Edad de Estudiantes (15-65)
- **Uso**: Validar edad de estudiantes
- **Rango**: 15 a 65 años
- **Ejemplo**:
```javascript
const error = validateStudentAge(20) // null (válido)
const error = validateStudentAge(10) // "La edad mínima es 15 años"
```

### 2. **Validaciones de Texto**

#### `validateIncidentDescription(value)` - Descripciones de Incidencias (8-300 caracteres)
- **Uso**: Validar reportes de incidencias académicas
- **Rango**: 8 a 300 caracteres
- **Ejemplo**:
```javascript
const error = validateIncidentDescription("El estudiante llegó tarde a clase y no trajo su material") // null (válido)
const error = validateIncidentDescription("Tarde") // "La descripción debe tener al menos 8 caracteres"
```

#### `validatePersonName(value)` - Nombres de Personas (2-50 caracteres)
- **Uso**: Validar nombres de estudiantes, docentes, etc.
- **Rango**: 2 a 50 caracteres, solo letras y espacios
- **Ejemplo**:
```javascript
const error = validatePersonName("María García") // null (válido)
const error = validatePersonName("A") // "El nombre debe tener al menos 2 caracteres"
const error = validatePersonName("Juan123") // "El nombre solo puede contener letras y espacios"
```

#### `validateSubjectCode(value)` - Códigos de Materias (formato ABC123)
- **Uso**: Validar códigos de materias
- **Formato**: 3 letras + 3 números
- **Ejemplo**:
```javascript
const error = validateSubjectCode("MAT101") // null (válido)
const error = validateSubjectCode("MATH1") // "El código debe tener el formato ABC123 (3 letras y 3 números)"
```

### 3. **Validaciones de Contacto**

#### `validateEmail(value)` - Emails
- **Uso**: Validar correos electrónicos
- **Ejemplo**:
```javascript
const error = validateEmail("profesor@kairolink.com") // null (válido)
const error = validateEmail("email-invalido") // "Ingresa un email válido"
```

#### `validatePhoneNumber(value)` - Teléfonos Mexicanos
- **Uso**: Validar números telefónicos
- **Formato**: 10 dígitos
- **Ejemplo**:
```javascript
const error = validatePhoneNumber("5551234567") // null (válido)
const error = validatePhoneNumber("123") // "Ingresa un número de teléfono válido (10 dígitos)"
```

### 4. **Validaciones de Fechas**

#### `validateDateRange(startDate, endDate)` - Rangos de Fechas
- **Uso**: Validar períodos académicos
- **Limitación**: Máximo 6 meses de duración
- **Ejemplo**:
```javascript
const error = validateDateRange("2025-07-01", "2025-12-15") // null (válido)
const error = validateDateRange("2025-07-01", "2025-06-15") // "La fecha de inicio debe ser anterior a la fecha de fin"
```

#### `validateBirthDate(value)` - Fechas de Nacimiento
- **Uso**: Validar fechas de nacimiento
- **Rango**: Edad entre 15 y 65 años
- **Ejemplo**:
```javascript
const error = validateBirthDate("2000-05-15") // null (válido para edad 25)
const error = validateBirthDate("2020-01-01") // "La edad mínima es 15 años"
```

### 5. **Validaciones Específicas del Sistema**

#### `validateActivitiesWeightSum(activities)` - Suma de Porcentajes
- **Uso**: Verificar que los porcentajes de actividades sumen 100%
- **Ejemplo**:
```javascript
const activities = [
  { name: "Examen", weight: 60 },
  { name: "Tareas", weight: 40 }
]
const error = validateActivitiesWeightSum(activities) // null (válido, suma 100%)
```

#### `validateUniqueActivityNames(activities)` - Nombres Únicos
- **Uso**: Verificar que no haya actividades con nombres duplicados
- **Ejemplo**:
```javascript
const activities = [
  { name: "Examen" },
  { name: "Tareas" },
  { name: "Examen" } // Duplicado
]
const error = validateUniqueActivityNames(activities) // "Los nombres de las actividades deben ser únicos"
```

#### `validateAcademicUnit(unitData)` - Unidades Académicas Completas
- **Uso**: Validar formularios completos de unidades académicas
- **Ejemplo**:
```javascript
const unitData = {
  name: "Unidad 1 - Fundamentos",
  description: "Conceptos básicos de programación",
  subject: "poo",
  startDate: "2025-07-01",
  endDate: "2025-08-15",
  activities: [
    { name: "Examen", weight: 70 },
    { name: "Tareas", weight: 30 }
  ]
}
const result = validateAcademicUnit(unitData)
// { isValid: true, errors: {}, firstError: null }
```

## 🔧 Funciones Utilitarias

### `sanitizeGrade(value)` - Limpiar Calificaciones
- **Uso**: Forzar calificaciones al rango válido (0-100)
- **Ejemplo**:
```javascript
const clean = sanitizeGrade(105) // 100
const clean = sanitizeGrade(-5) // 0
const clean = sanitizeGrade(85) // 85
```

### `sanitizePercentage(value)` - Limpiar Porcentajes
- **Uso**: Forzar porcentajes al rango válido (0-100)
- **Ejemplo**:
```javascript
const clean = sanitizePercentage(150) // 100
const clean = sanitizePercentage(-10) // 0
```

### `validateMultipleFields(validations, validators)` - Validación Múltiple
- **Uso**: Validar varios campos simultáneamente
- **Ejemplo**:
```javascript
const validations = {
  nombre: "Juan Pérez",
  email: "juan@example.com",
  calificacion: 85
}

const validators = {
  nombre: validatePersonName,
  email: validateEmail,
  calificacion: validateGrade
}

const result = validateMultipleFields(validations, validators)
// { isValid: true, errors: {}, firstError: null }
```

## 🚀 Ejemplos de Uso en Componentes

### Validación en Tiempo Real
```javascript
import { validateGrade } from '../utils/validations'

const [errors, setErrors] = useState({})

const handleGradeChange = (studentId, value) => {
  const error = validateGrade(value)
  setErrors(prev => ({
    ...prev,
    [studentId]: error
  }))
}

// En el JSX
<TextField
  value={grade}
  onChange={(e) => handleGradeChange(studentId, e.target.value)}
  error={!!errors[studentId]}
  helperText={errors[studentId]}
/>
```

### Validación de Formularios
```javascript
import { validateAcademicUnit } from '../utils/validations'

const handleSubmit = (e) => {
  e.preventDefault()
  
  const result = validateAcademicUnit(formData)
  
  if (!result.isValid) {
    alert(result.firstError)
    return
  }
  
  // Proceder con el envío
  saveUnit(formData)
}
```

### Sanitización de Datos
```javascript
import { sanitizeGrade } from '../utils/validations'

const handleBlur = (value) => {
  const cleanValue = sanitizeGrade(value)
  setGrade(cleanValue)
}
```

## 📍 Componentes Actualizados

Los siguientes componentes ya están usando estas validaciones:

1. **`/features/tutor/pages/Calificaciones.jsx`**
   - ✅ `validateGrade()` para calificaciones
   - ✅ `sanitizeGrade()` en blur events

2. **`/features/docente/pages/Calificaciones.jsx`**
   - ✅ `validateGrade()` para calificaciones
   - ✅ `sanitizeGrade()` en blur events

3. **`/features/tutor/pages/RegistrarUnidades.jsx`**
   - ✅ `validateAcademicUnit()` para unidades completas
   - ✅ `validateActivityWeight()` para porcentajes

4. **`/features/docente/pages/RegistrarUnidades.jsx`**
   - ✅ `validateAcademicUnit()` para unidades completas
   - ✅ `validateActivityWeight()` para porcentajes

5. **`/features/docente/pages/ReportarIncidencia.jsx`**
   - ✅ `validateIncidentDescription()` para descripciones
   - ✅ `validatePersonName()` para nombres

6. **`/features/director/pages/Personal.jsx`**
   - ✅ `validateEmail()` para correos
   - ✅ `validatePhoneNumber()` para teléfonos
   - ✅ `validatePersonName()` para nombres

## 🎨 Beneficios del Sistema

1. **Consistencia**: Todas las validaciones siguen los mismos estándares
2. **Reutilización**: Una validación, múltiples usos
3. **Mantenibilidad**: Cambios centralizados en un solo archivo
4. **Flexibilidad**: Fácil agregar nuevas validaciones
5. **UX mejorada**: Validación en tiempo real con mensajes claros
6. **Robustez**: Validaciones específicas para el ámbito educativo

## 🔄 Cómo Agregar Nuevas Validaciones

1. **Crear la función de validación** en `/utils/validations.js`
2. **Exportarla** en el export default
3. **Importarla** en el componente que la necesite
4. **Usarla** en el manejo de cambios o envío de formularios
5. **Documentarla** aquí en el README

¡El sistema está listo para escalar y mantener la calidad de los datos en toda la aplicación! 🎓
