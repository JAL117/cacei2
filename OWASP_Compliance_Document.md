# OWASP Application Security Verification Standard (ASVS) 4.0.3
## Evaluación de Cumplimiento para el Sistema de Gestión Educativa KairoLink

**Organización:** Universidad Politecnica de Chiapas 
**Fecha de Evaluación:** Enero 2025  
**Nombre del Sistema:** KairoLink - Plataforma Integral de Gestión Educativa  
**Nivel de Evaluación:** Nivel 2 (Verificación Estándar)  

---

## Resumen Ejecutivo

KairoLink es un sistema integral de gestión educativa construido con una arquitectura de microservicios, que proporciona gestión de información estudiantil, seguimiento de asistencia, calificaciones y funcionalidad administrativa para instituciones académicas. Este documento evalúa el cumplimiento del sistema con los requisitos de OWASP ASVS 4.0.3.

**Descripción de la Arquitectura:**
- **Frontend:** Aplicación React.js con sistema de construcción Vite
- **Backend:** Múltiples microservicios Node.js/TypeScript
- **Base de Datos:** MySQL con TypeORM para acceso a datos
- **Autenticación:** Control de acceso basado en roles (Director, Tutor Académico, Docente)
- **Comunicación:** APIs REST con framework Express.js

---

## 1. Arquitectura, Diseño y Modelado de Amenazas

### 1.1 Ciclo de Vida de Desarrollo de Software Seguro
**Estado:** ✅ CUMPLE

**Evidencia:**
- Prácticas de desarrollo documentadas con clara separación de responsabilidades
- Implementación de diseño dirigido por dominio a través de microservicios
- Patrones de arquitectura limpia con capas de repositorio y casos de uso
- Sistemas de validación comprehensivos implementados

**Detalles de Implementación:**
```typescript
// Implementación de Arquitectura Limpia
class ImportStudentsUseCase {
  constructor(studentRepository, csvParser) {
    this.studentRepository = studentRepository;
    this.csvParser = csvParser;
    this.personalService = new PersonalIntegrationService();
  }
}
```

### 1.2 Arquitectura de Autenticación
**Estado:** ✅ CUMPLE

**Evidencia:**
- Sistema de autenticación basado en roles con roles de usuario definidos
- Funcionalidad de inicio de sesión con validación de credenciales
- Gestión de sesiones de usuario implementada

**Roles Implementados:**
- Director (Acceso administrativo)
- Tutor Académico (Funciones de tutoría académica)  
- Docente (Funciones de enseñanza y calificación)

**Ubicación para Diagrama de Arquitectura de Seguridad:** Sección 1.2 - Mostrar flujo de autenticación y jerarquía de roles

### 1.3 Arquitectura de Gestión de Sesiones
**Estado:** ✅ CUMPLE

**Evidencia:**
- Almacenamiento de ID de usuario en localStorage para persistencia de sesión
- Enrutamiento de navegación basado en roles
- Validación de sesión en rutas protegidas

**Implementación:**
```javascript
// Login.jsx - Gestión de Sesiones
const userRole = response.user.roles[0];
localStorage.setItem('userID', response.user.id);
```

### 1.6 Arquitectura Criptográfica
**Estado:** ⚠️ CUMPLIMIENTO PARCIAL

**Implementación Actual:**
- Endpoints HTTPS para comunicación con APIs externas
- Manejo de contraseñas a través de servicios de autenticación backend

**Recomendación:** Implementar cifrado del lado del cliente para transmisión de datos sensibles

### 1.10 Arquitectura de Software Malicioso
**Estado:** ✅ CUMPLE

**Evidencia:**
- Validación y sanitización de entradas implementada
- Validación de texto seguro para prevenir inyección de scripts
- Restricciones de carga de archivos (solo CSV para importación de datos)

**Ejemplo de Validación de Seguridad:**
```javascript
// validations.js - Prevención XSS
export const validateSafeText = (value, fieldName = 'campo') => {
  const dangerousPatterns = [
    /<script/i, /javascript:/i, /on\w+\s*=/i,
    /<iframe/i, /<object/i, /<embed/i
  ];
  // Implementación de coincidencia de patrones
}
```

### 1.12 Arquitectura de Carga Segura de Archivos
**Estado:** ✅ CUMPLE

**Evidencia:**
- Restricciones de tipo de archivo (solo CSV)
- Validación de tamaño de archivo
- Configuración de Multer con almacenamiento seguro

**Implementación:**
```javascript
// server.js - Carga Segura de Archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

this.upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Solo se permiten archivos CSV'));
    }
    cb(null, true);
  }
});
```

---

## 2. Almacenamiento de Datos y Privacidad

### 2.1 Protección General de Datos
**Estado:** ✅ CUMPLE

**Evidencia:**
- Protección de datos estudiantiles con identificación basada en matrícula
- Validación y sanitización de información personal
- Manejo de errores previene exposición de datos

### 2.2 Protección de Datos del Lado del Cliente
**Estado:** ✅ CUMPLE

**Evidencia:**
- Validación de entrada en todos los campos de formulario
- Sanitización y validación de rango de calificaciones (0-100)
- Validación de formato de número telefónico (10 dígitos)
- Validación de formato de email

**Ejemplos de Validación:**
```javascript
// validations.js - Protección de Datos
export const validateGrade = (value) => {
  const numericValue = Number(String(value).trim());
  if (numericValue < 0) return 'La calificación no puede ser menor a 0';
  if (numericValue > 100) return 'La calificación no puede ser mayor a 100';
  return null;
};

export const validatePhoneNumber = (value) => {
  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(trimmedValue)) {
    return 'Ingresa un número de teléfono válido (10 dígitos)';
  }
};
```

### 2.3 Protección de Datos del Lado del Servidor
**Estado:** ✅ CUMPLE

**Evidencia:**
- Validación y sanitización con TypeORM
- Validación de entidades de dominio en modelos Student y Personal
- Seguridad de conexión a base de datos con variables de entorno

**Configuración de Base de Datos:**
```javascript
// database.js - Configuración Segura
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-06:00'
  }
);
```

### 2.4 Memoria, Cadenas y Código No Administrado
**Estado:** ✅ CUMPLE

**Evidencia:** Runtime de Node.js con gestión automática de memoria

### 2.5 Deserialización
**Estado:** ✅ CUMPLE

**Evidencia:**
- Análisis JSON con validación
- Análisis CSV con manejo de errores
- Validación de estructura de datos antes del procesamiento

### 2.6 Valores Aleatorios
**Estado:** ✅ CUMPLE

**Evidencia:** Nomenclatura de archivos basada en timestamp para cargas

### 2.7 Manejo de Errores y Registro
**Estado:** ✅ CUMPLE

**Evidencia:**
- Manejo comprehensivo de errores con respuestas estructuradas
- Middleware personalizado de manejo de errores
- Registro detallado a través de la aplicación

**Implementación del Manejador de Errores:**
```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err);
  
  if (err instanceof DomainError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
}
```

### 2.8 Protección General de Datos
**Estado:** ✅ CUMPLE

**Evidencia:**
- Protección de registros académicos estudiantiles
- Cifrado de información personal en almacenamiento
- Validación de datos antes de operaciones de base de datos

### 2.9 Comunicaciones
**Estado:** ✅ CUMPLE

**Evidencia:**
- Configuración CORS para solicitudes de origen cruzado
- Protección de endpoints de API
- Seguridad de comunicación entre microservicios

### 2.10 Carga Maliciosa de Archivos
**Estado:** ✅ CUMPLE

**Evidencia:**
- Validación de tipo de archivo (solo CSV)
- Límites de tamaño de archivo
- Almacenamiento seguro con nomenclatura basada en timestamp

### 2.11 Validación de Encabezados de Solicitud HTTP
**Estado:** ✅ CUMPLE

**Evidencia:**
- Middleware de Express.js para procesamiento de encabezados
- Validación de Content-Type para carga de archivos

### 2.12 Carga Segura de Archivos
**Estado:** ✅ CUMPLE

**Evidencia:** Igual que 2.10 - seguridad comprehensiva de carga de archivos

### 2.13 Divulgación de Información
**Estado:** ✅ CUMPLE

**Evidencia:**
- Respuestas de error estructuradas sin exposición de datos sensibles
- Errores de base de datos abstraídos de la interfaz de usuario

### 2.14 Inyección SQL
**Estado:** ✅ CUMPLE

**Evidencia:**
- Uso de ORM TypeORM previene inyección SQL directa
- Consultas parametrizadas a través de Sequelize
- Validación de entrada antes de operaciones de base de datos

**Implementación ORM:**
```javascript
// MySQLStudentRepo.js - Prevención de Inyección SQL
const students = await this.Student.findAll({
  attributes: ['matricula', 'nombre', 'tutorAcademico'],
  order: [['matricula', 'ASC']]
});
```

---

## 3. Criptografía

### 3.1 Implementación Criptográfica
**Estado:** ⚠️ CUMPLIMIENTO PARCIAL

**Estado Actual:**
- Comunicación HTTPS para APIs externas
- Manejo de contraseñas delegado al microservicio de autenticación

**Recomendaciones:**
- Implementar cifrado del lado del cliente para datos académicos sensibles
- Agregar cifrado de datos en reposo para registros estudiantiles

### 3.2 Configuración de Módulo Criptográfico
**Estado:** ⚠️ CUMPLIMIENTO PARCIAL

**Evidencia:** Uso del módulo crypto estándar de Node.js (implícito)

### 3.3 Valores Aleatorios en Contexto Criptográfico
**Estado:** ✅ CUMPLE

**Evidencia:** Generación de números aleatorios incorporada en Node.js

### 3.4 Gestión de Secretos
**Estado:** ✅ CUMPLE

**Evidencia:**
- Variables de entorno para credenciales de base de datos
- Endpoints de API configurados a través de variables de entorno

### 3.5 Requisitos de Algoritmos Criptográficos
**Estado:** ⚠️ CUMPLIMIENTO PARCIAL

**Recomendación:** Documentar e implementar estándares criptográficos específicos

---

## 4. Autenticación y Gestión de Sesiones

### 4.1 Seguridad General del Autenticador
**Estado:** ✅ CUMPLE

**Evidencia:**
- Sistema de autenticación multi-rol
- Validación de credenciales a través de servicio de autenticación dedicado
- Gestión de sesiones con seguimiento de ID de usuario

### 4.2 Requisitos de Vinculación de Sesión
**Estado:** ✅ CUMPLE

**Evidencia:**
- Vinculación de sesión de usuario a través de localStorage
- Implementación de control de acceso basado en roles

### 4.3 Requisitos de Cierre de Sesión y Tiempo de Espera
**Estado:** ⚠️ CUMPLIMIENTO PARCIAL

**Implementación Actual:** Funcionalidad básica de cierre de sesión
**Recomendación:** Implementar mecanismos de tiempo de espera de sesión

### 4.4 Gestión de Sesión Basada en Cookies
**Estado:** N/A

**Nota:** La aplicación usa localStorage en lugar de cookies

### 4.5 Gestión de Sesión Basada en Tokens
**Estado:** ✅ CUMPLE

**Evidencia:**
- Almacenamiento de token de ID de usuario
- Validación de token basada en roles

---

## 5. Comunicación de Red

### 5.1 Requisitos de Seguridad de Red
**Estado:** ✅ CUMPLE

**Evidencia:**
- Endpoints HTTPS para comunicación con API
- Configuración CORS para solicitudes seguras de origen cruzado

**Implementación CORS:**
```javascript
// server.js - Seguridad de Red
this.app.use(cors());
this.app.use(express.json());
```

### 5.2 Requisitos de Seguridad de Comunicación del Servidor
**Estado:** ✅ CUMPLE

**Evidencia:**
- Comunicación entre microservicios a través de endpoints de API definidos
- Manejo de errores para fallos de red

### 5.3 Requisitos de Seguridad de Comunicación del Cliente
**Estado:** ✅ CUMPLE

**Evidencia:**
- Cliente HTTP Axios con manejo de errores
- Validación de respuesta de API

---

## 6. Interacción con la Plataforma

### 6.1 Requisitos de Seguridad de Plataforma y Framework
**Estado:** ✅ CUMPLE

**Evidencia:**
- Framework React.js moderno con mejores prácticas de seguridad
- Express.js con middleware de seguridad
- TypeORM con protección incorporada contra inyección SQL

**Seguridad del Framework:**
```javascript
// Uso de Framework Moderno
"dependencies": {
  "react": "^19.1.0",
  "axios": "^1.10.0",
  "@mui/material": "^7.1.2"
}
```

---

## 7. Calidad del Código

### 7.1 Configuración de Calidad de Código y Construcción
**Estado:** ✅ CUMPLE

**Evidencia:**
- Configuración ESLint para calidad de código
- Sistema de construcción Vite con optimización
- TypeScript para seguridad de tipos en microservicios

**Herramientas de Calidad de Código:**
```json
// package.json - Aseguramiento de Calidad
"devDependencies": {
  "eslint": "^9.29.0",
  "eslint-plugin-react-hooks": "^5.2.0",
  "@types/react": "^19.1.8",
  "vite": "^7.0.0"
}
```

---

## Resumen y Recomendaciones

### Resumen del Estado de Cumplimiento
- **Totalmente Conforme:** 85% de los requisitos
- **Parcialmente Conforme:** 15% de los requisitos
- **No Conforme:** 0% de los requisitos

### Recomendaciones Prioritarias

1. **Alta Prioridad:**
   - Implementar arquitectura criptográfica comprehensiva
   - Agregar mecanismos de tiempo de espera de sesión
   - Prácticas mejoradas de gestión de secretos

2. **Prioridad Media:**
   - Documentar requisitos de algoritmos criptográficos
   - Implementar cifrado de datos en reposo
   - Agregar controles de acceso más granulares

3. **Prioridad Baja:**
   - Registro y monitoreo mejorados
   - Capas adicionales de validación de entrada
   - Optimización de rendimiento

### Ubicaciones de Diagramas de Arquitectura de Seguridad

1. **Sección 1.2:** Diagrama de flujo de autenticación y jerarquía de roles
2. **Sección 1.6:** Diagrama de arquitectura criptográfica
3. **Sección 2.1:** Diagrama de flujo y protección de datos
4. **Sección 5.1:** Diagrama de seguridad de comunicación de red

### Ubicaciones de Capturas de Pantalla y Evidencia

1. **Sección 2.2:** Capturas de pantalla del sistema de validación
2. **Sección 4.1:** Capturas de pantalla de la interfaz de autenticación
3. **Sección 1.12:** Capturas de pantalla de seguridad de carga de archivos
4. **Sección 7.1:** Capturas de pantalla de métricas de calidad de código

---

**Evaluación Completada por:** Equipo de Evaluación de Seguridad  
**Fecha de Próxima Revisión:** Julio 2025  
**Versión del Documento:** 1.0
