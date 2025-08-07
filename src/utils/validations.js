// Validación para calificaciones de estudiantes (0-100 puntos)
export const validateGrade = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'La calificación es requerida';
  }
  
  const numericValue = Number(String(value).trim());
  if (isNaN(numericValue)) {
    return 'La calificación debe ser un número válido';
  }
  
  if (numericValue < 0) {
    return 'La calificación no puede ser menor a 0';
  }
  
  if (numericValue > 100) {
    return 'La calificación no puede ser mayor a 100';
  }
  
  return null;
};

// Validación para porcentajes de ponderación de actividades (1-100%)
export const validateActivityWeight = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'El porcentaje es requerido';
  }
  
  const numericValue = Number(String(value).trim());
  if (isNaN(numericValue)) {
    return 'El porcentaje debe ser un número válido';
  }
  
  if (numericValue < 1) {
    return 'El porcentaje mínimo es 1%';
  }
  
  if (numericValue > 100) {
    return 'El porcentaje máximo es 100%';
  }
  
  return null;
};

// Validación para créditos académicos de materias (1-12 créditos)
export const validateCredits = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'Los créditos son requeridos';
  }
  
  const numericValue = parseInt(String(value).trim());
  if (isNaN(numericValue)) {
    return 'Los créditos deben ser un número entero';
  }
  
  if (numericValue < 1) {
    return 'Los créditos mínimos son 1';
  }
  
  if (numericValue > 12) {
    return 'Los créditos máximos son 12';
  }
  
  return null;
};

// Validación para horas académicas semanales (1-40 horas)
export const validateWeeklyHours = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'Las horas semanales son requeridas';
  }
  
  const numericValue = parseInt(String(value).trim());
  if (isNaN(numericValue)) {
    return 'Las horas deben ser un número entero';
  }
  
  if (numericValue < 1) {
    return 'Las horas mínimas son 1';
  }
  
  if (numericValue > 40) {
    return 'Las horas máximas son 40 por semana';
  }
  
  return null;
};

// Validación para edad de estudiantes (15-65 años)
export const validateStudentAge = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return 'La edad es requerida';
  }
  
  const numericValue = parseInt(String(value).trim());
  if (isNaN(numericValue)) {
    return 'La edad debe ser un número entero';
  }
  
  if (numericValue < 15) {
    return 'La edad mínima es 15 años';
  }
  
  if (numericValue > 65) {
    return 'La edad máxima es 65 años';
  }
  
  return null;
};

// Validación específica para descripción de incidencias (8-300 caracteres)
export const validateIncidentDescription = (value) => {
  if (value == null || String(value).trim() === '') {
    return 'La descripción de la incidencia es requerida';
  }
  
  const trimmedValue = String(value).trim();
  
  if (trimmedValue.length < 8) {
    return 'La descripción debe tener al menos 8 caracteres';
  }
  
  if (trimmedValue.length > 300) {
    return 'La descripción no puede exceder 300 caracteres';
  }
  
  return null;
};

// Validación para nombres de personas (2-50 caracteres)
export const validatePersonName = (value) => {
  if (!value || String(value).trim() === '') {
    return 'El nombre es requerido';
  }
  
  const trimmedValue = String(value).trim();
  
  if (trimmedValue.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (trimmedValue.length > 50) {
    return 'El nombre no puede exceder 50 caracteres';
  }
  
  const namePattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/;
  if (!namePattern.test(trimmedValue)) {
    return 'El nombre solo puede contener letras y espacios';
  }
  
  return null;
};

// Validación para códigos de materias (formato: ABC123)
export const validateSubjectCode = (value) => {
  if (!value || String(value).trim() === '') {
    return 'El código de materia es requerido';
  }
  
  const trimmedValue = String(value).trim().toUpperCase();
  
  const codePattern = /^[A-Z]{3}\d{3}$/;
  if (!codePattern.test(trimmedValue)) {
    return 'El código debe tener el formato ABC123 (3 letras y 3 números)';
  }
  
  return null;
};

// Validación para emails institucionales
export const validateEmail = (value) => {
  if (!value || String(value).trim() === '') {
    return 'El email es requerido';
  }
  
  const trimmedValue = String(value).trim();
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedValue)) {
    return 'Ingresa un email válido';
  }
  
  if (trimmedValue.length > 100) {
    return 'El email no puede exceder 100 caracteres';
  }
  
  return null;
};

// Validación para números telefónicos mexicanos
export const validatePhoneNumber = (value) => {
  if (!value || String(value).trim() === '') {
    return 'El número de teléfono es requerido';
  }
  
  const trimmedValue = String(value).trim().replace(/\s/g, '');
  
  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(trimmedValue)) {
    return 'Ingresa un número de teléfono válido (10 dígitos)';
  }
  
  return null;
};

// Validación para fechas de inicio y fin de unidades
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 'Las fechas de inicio y fin son requeridas';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Las fechas deben ser válidas';
  }
  
  if (start >= end) {
    return 'La fecha de inicio debe ser anterior a la fecha de fin';
  }
  
  const diffTime = Math.abs(end - start);
  const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
  
  if (diffMonths > 4) {
    return 'El periodo no puede ser mayor a 4 meses';
  }
  
  return null;
};

// Validación para fecha de nacimiento
export const validateBirthDate = (value) => {
  if (!value) {
    return 'La fecha de nacimiento es requerida';
  }
  
  const birthDate = new Date(value);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return 'Ingresa una fecha válida';
  }
  
  if (birthDate >= today) {
    return 'La fecha de nacimiento debe ser anterior a hoy';
  }
  
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 15) {
    return 'La edad mínima es 15 años';
  }
  
  if (age > 65) {
    return 'La edad máxima es 65 años';
  }
  
  return null;
};

// Validación para que los porcentajes de actividades sumen 100%
export const validateActivitiesWeightSum = (activities) => {
  if (!activities || activities.length === 0) {
    return 'Debe haber al menos una actividad';
  }
  
  const totalWeight = activities.reduce((sum, activity) => {
    return sum + (Number(activity.weight) || 0);
  }, 0);
  
  if (totalWeight !== 100) {
    return `Los porcentajes deben sumar exactamente 100%. Actualmente suman ${totalWeight}%`;
  }
  
  return null;
};

// Validación para nombres de actividades únicos dentro de una unidad
export const validateUniqueActivityNames = (activities) => {
  if (!activities || activities.length === 0) {
    return null;
  }
  
  const names = activities.map(activity => activity.name?.trim().toLowerCase()).filter(Boolean);
  const uniqueNames = new Set(names);
  
  if (names.length !== uniqueNames.size) {
    return 'Los nombres de las actividades deben ser únicos';
  }
  
  return null;
};

// Validación para verificar que un usuario tenga el rol necesario
export const validateUserRole = (userRole, allowedRoles) => {
  if (!userRole) {
    return 'El usuario debe tener un rol asignado';
  }
  
  if (!allowedRoles.includes(userRole)) {
    return 'No tienes permisos para realizar esta acción';
  }
  
  return null;
};

// Valida múltiples campos y retorna el primer error encontrado
export const validateMultipleFields = (validations, validators) => {
  const errors = {};
  let firstError = null;
  
  for (const [field, value] of Object.entries(validations)) {
    if (validators[field]) {
      const error = validators[field](value);
      if (error) {
        errors[field] = error;
        if (!firstError) {
          firstError = error;
        }
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError
  };
};

// Sanitiza una calificación asegurando que esté en el rango válido
export const sanitizeGrade = (value) => {
  const numericValue = Number(String(value).trim()) || 0;
  return Math.max(0, Math.min(100, numericValue));
};

// Sanitiza un porcentaje asegurando que esté en el rango válido
export const sanitizePercentage = (value) => {
  const numericValue = Number(String(value).trim()) || 0;
  return Math.max(0, Math.min(100, numericValue));
};

// Valida un formulario completo de unidad académica
export const validateAcademicUnit = (unitData) => {
  const validators = {
    name: (value) => {
      if (!value || String(value).trim() === '') {
        return 'El nombre de la unidad es requerido';
      }
      if (String(value).trim().length < 5) {
        return 'El nombre debe tener al menos 5 caracteres';
      }
      if (String(value).trim().length > 100) {
        return 'El nombre no puede exceder 100 caracteres';
      }
      return null;
    },
    description: (value) => {
      if (!value || String(value).trim() === '') {
        return 'La descripción es requerida';
      }
      if (String(value).trim().length < 10) {
        return 'La descripción debe tener al menos 10 caracteres';
      }
      if (String(value).trim().length > 500) {
        return 'La descripción no puede exceder 500 caracteres';
      }
      return null;
    },
    subject: (value) => {
      if (!value || String(value).trim() === '') {
        return 'La materia es requerida';
      }
      return null;
    }
  };
  
  const validationResult = validateMultipleFields({
    name: unitData.name,
    description: unitData.description,
    subject: unitData.subject
  }, validators);
  
  if (unitData.startDate && unitData.endDate) {
    const dateError = validateDateRange(unitData.startDate, unitData.endDate);
    if (dateError) {
      validationResult.errors.dateRange = dateError;
      validationResult.isValid = false;
      if (!validationResult.firstError) {
        validationResult.firstError = dateError;
      }
    }
  }
  
  if (unitData.activities) {
    const activitiesError = validateActivitiesWeightSum(unitData.activities);
    if (activitiesError) {
      validationResult.errors.activities = activitiesError;
      validationResult.isValid = false;
      if (!validationResult.firstError) {
        validationResult.firstError = activitiesError;
      }
    }
    
    const uniqueNamesError = validateUniqueActivityNames(unitData.activities);
    if (uniqueNamesError) {
      validationResult.errors.activityNames = uniqueNamesError;
      validationResult.isValid = false;
      if (!validationResult.firstError) {
        validationResult.firstError = uniqueNamesError;
      }
    }
  }
  
  return validationResult;
};

// Validación para texto alfanumérico (solo letras, números y espacios)
export const validateAlphanumeric = (value, fieldName = 'campo') => {
  if (!value || String(value).trim() === '') {
    return `El ${fieldName} es requerido`;
  }
  
  const trimmedValue = String(value).trim();
  const alphanumericPattern = /^[a-zA-Z0-9\s]+$/;
  
  if (!alphanumericPattern.test(trimmedValue)) {
    return `El ${fieldName} solo puede contener letras, números y espacios`;
  }
  
  return null;
};

// Validación para texto solo con letras (incluye acentos y ñ)
export const validateLettersOnly = (value, fieldName = 'campo') => {
  if (!value || String(value).trim() === '') {
    return `El ${fieldName} es requerido`;
  }
  
  const trimmedValue = String(value).trim();
  const lettersPattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/;
  
  if (!lettersPattern.test(trimmedValue)) {
    return `El ${fieldName} solo puede contener letras y espacios`;
  }
  
  return null;
};

// Validación para números enteros positivos
export const validatePositiveInteger = (value, fieldName = 'campo') => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `El ${fieldName} es requerido`;
  }
  
  const trimmedValue = String(value).trim();
  const positiveIntPattern = /^\d+$/;
  
  if (!positiveIntPattern.test(trimmedValue)) {
    return `El ${fieldName} solo puede contener números enteros positivos`;
  }
  
  const numericValue = parseInt(trimmedValue);
  if (numericValue <= 0) {
    return `El ${fieldName} debe ser mayor a cero`;
  }
  
  return null;
};

// Validación para códigos alfanuméricos (sin espacios ni caracteres especiales)
export const validateAlphanumericCode = (value, fieldName = 'código') => {
  if (!value || String(value).trim() === '') {
    return `El ${fieldName} es requerido`;
  }
  
  const trimmedValue = String(value).trim();
  const codePattern = /^[a-zA-Z0-9]+$/;
  
  if (!codePattern.test(trimmedValue)) {
    return `El ${fieldName} solo puede contener letras y números (sin espacios ni símbolos)`;
  }
  
  return null;
};

// Validación para descripción académica (letras, números, espacios y puntuación básica)
export const validateAcademicDescription = (value, fieldName = 'descripción') => {
  if (!value || String(value).trim() === '') {
    return `La ${fieldName} es requerida`;
  }
  
  const trimmedValue = String(value).trim();
  const descriptionPattern = /^[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\.,\-()]+$/;
  
  if (!descriptionPattern.test(trimmedValue)) {
    return `La ${fieldName} contiene caracteres no permitidos. Solo se permiten letras, números, espacios y puntuación básica (. , - ( ))`;
  }
  
  return null;
};

// Validación para nombres de usuario (alfanumérico con guiones bajos)
export const validateUsername = (value) => {
  if (!value || String(value).trim() === '') {
    return 'El nombre de usuario es requerido';
  }
  
  const trimmedValue = String(value).trim();
  const usernamePattern = /^[a-zA-Z0-9_]+$/;
  
  if (!usernamePattern.test(trimmedValue)) {
    return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
  }
  
  if (trimmedValue.length < 3) {
    return 'El nombre de usuario debe tener al menos 3 caracteres';
  }
  
  if (trimmedValue.length > 20) {
    return 'El nombre de usuario no puede exceder 20 caracteres';
  }
  
  return null;
};

// Validación para prevenir inyección de scripts y caracteres peligrosos
export const validateSafeText = (value, fieldName = 'campo') => {
  if (!value || String(value).trim() === '') {
    return `El ${fieldName} es requerido`;
  }
  
  const trimmedValue = String(value).trim();
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedValue)) {
      return `El ${fieldName} contiene contenido no permitido por seguridad`;
    }
  }
  
  return null;
};

// Validación específica para nombres de actividades académicas
export const validateActivityName = (value) => {
  const safetyError = validateSafeText(value, 'nombre de actividad');
  if (safetyError) return safetyError;
  
  const academicError = validateAcademicDescription(value, 'nombre de actividad');
  if (academicError) return academicError;
  
  const trimmedValue = String(value).trim();
  
  if (trimmedValue.length < 3) {
    return 'El nombre de la actividad debe tener al menos 3 caracteres';
  }
  
  if (trimmedValue.length > 50) {
    return 'El nombre de la actividad no puede exceder 50 caracteres';
  }
  
  return null;
};

// Validación para matrículas estudiantiles (formato específico)
export const validateStudentMatricula = (value) => {
  if (!value || String(value).trim() === '') {
    return 'La matrícula es requerida';
  }
  
  const trimmedValue = String(value).trim();
  const matriculaPattern = /^20\d{5}$/;
  
  if (!matriculaPattern.test(trimmedValue)) {
    return 'La matrícula debe tener el formato 20XXXXX (año + 3 dígitos)';
  }
  
  return null;
};

export default {
  validateGrade,
  validateActivityWeight,
  validateCredits,
  validateWeeklyHours,
  validateStudentAge,
  
  validateIncidentDescription,
  validatePersonName,
  validateSubjectCode,
  
  validateEmail,
  validatePhoneNumber,
  
  validateDateRange,
  validateBirthDate,
  
  validateActivitiesWeightSum,
  validateUniqueActivityNames,
  validateUserRole,
  
  validateMultipleFields,
  sanitizeGrade,
  sanitizePercentage,
  validateAcademicUnit,
  
  // Validaciones de contenido (caracteres permitidos/no permitidos)
  validateAlphanumeric,
  validateLettersOnly,
  validatePositiveInteger,
  validateAlphanumericCode,
  validateAcademicDescription,
  validateUsername,
  validateSafeText,
  validateActivityName,
  validateStudentMatricula
};
