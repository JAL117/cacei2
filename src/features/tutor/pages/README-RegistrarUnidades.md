# API de Unidades Académicas - Documentación

## 📋 Endpoints Utilizados

### 1. Obtener Cursos del Profesor
```
GET http://3.214.92.57:3000/curso/cursos/profesor/:profesor_usuario_id
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "asignatura_id": 5,
      "grupo_id": 12,
      "profesor_usuario_id": "123",
      "created_at": "2025-07-27T10:30:00.000Z",
      "updated_at": "2025-07-27T10:30:00.000Z"
    },
    {
      "id": 2,
      "asignatura_id": 8,
      "grupo_id": 15,
      "profesor_usuario_id": "123",
      "created_at": "2025-07-27T11:15:00.000Z",
      "updated_at": "2025-07-27T11:15:00.000Z"
    }
  ]
}
```

### 2. Obtener Materias por IDs
```
POST http://localhost:3002/api/materias/buscar-multiple
```

**Cuerpo de la solicitud:**
```json
{
  "asignatura_ids": [5, 8, 12]
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "nombre": "Cálculo Diferencial",
      "cuatrimestre": 1
    },
    {
      "id": 8,
      "nombre": "Programación Orientada a Objetos",
      "cuatrimestre": 2
    },
    {
      "id": 12,
      "nombre": "Base de Datos",
      "cuatrimestre": 3
    }
  ]
}
```

## 🆕 Endpoint para Crear Unidad

### Crear Nueva Unidad
```
POST http://localhost:3002/api/unidades
```

**Cuerpo de la solicitud:**
```json
{
  "profesor_id": "123",
  "asignatura_id": 5,
  "nombre": "Unidad 1 - Fundamentos de POO",
  "descripcion": "Introducción a los conceptos básicos de programación orientada a objetos",
  "fecha_inicio": "2025-07-01",
  "fecha_fin": "2025-07-31",
  "actividades": [
    {
      "nombre": "Examen Parcial",
      "descripcion": "Evaluación teórica de conceptos básicos",
      "ponderacion": 40.0
    },
    {
      "nombre": "Proyecto Final",
      "descripcion": "Desarrollo de aplicación usando POO",
      "ponderacion": 60.0
    }
  ]
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Unidad creada exitosamente",
  "data": {
    "id": 15,
    "profesor_id": "123",
    "asignatura_id": 5,
    "nombre": "Unidad 1 - Fundamentos de POO",
    "descripcion": "Introducción a los conceptos básicos de programación orientada a objetos",
    "fecha_inicio": "2025-07-01",
    "fecha_fin": "2025-07-31",
    "created_at": "2025-07-28T10:30:00.000Z",
    "actividades": [
      {
        "id": 25,
        "unidad_id": 15,
        "nombre": "Examen Parcial",
        "descripcion": "Evaluación teórica de conceptos básicos",
        "ponderacion": 40.0
      },
      {
        "id": 26,
        "unidad_id": 15,
        "nombre": "Proyecto Final",
        "descripcion": "Desarrollo de aplicación usando POO",
        "ponderacion": 60.0
      }
    ]
  }
}
```

## 📖 Otros Endpoints Necesarios

### Obtener Unidades del Profesor
```
GET http://localhost:3002/api/unidades/profesor/:profesor_id
```

### Actualizar Unidad
```
PUT http://localhost:3002/api/unidades/:unidad_id
```

**Cuerpo de la solicitud:** (mismo formato que crear)

### Eliminar Unidad
```
DELETE http://localhost:3002/api/unidades/:unidad_id
```

## 🔄 Flujo de Datos en el Frontend

```
1. Usuario ingresa a "Registrar Unidades"
   ↓
2. Sistema obtiene profesor_id desde localStorage
   ↓
3. GET /curso/cursos/profesor/:profesor_id (obtiene cursos asignados)
   ↓
4. Extrae asignatura_ids únicos del array de cursos
   ↓
5. POST /api/materias/buscar-multiple (obtiene info de materias)
   ↓
6. Sistema filtra y muestra solo las materias asignadas al profesor
   ↓
7. Usuario crea nueva unidad
   ↓
8. POST /api/unidades (envía datos de la unidad)
   ↓
9. Sistema actualiza lista local y cierra formulario
```

## 📊 Validaciones del Frontend

- **Ponderación total**: Debe sumar exactamente 100%
- **Fechas**: Fecha fin debe ser posterior a fecha inicio
- **Campos requeridos**: Todos los campos son obligatorios
- **Actividades**: Mínimo 1 actividad, máximo sin límite
- **Profesor**: Solo puede crear unidades para sus materias asignadas

## 🎯 Características Implementadas

- ✅ **Carga dinámica** de materias asignadas al profesor
- ✅ **Validación robusta** de datos antes de enviar
- ✅ **Estados de carga** para mejor UX
- ✅ **Manejo de errores** detallado
- ✅ **Edición** de unidades existentes
- ✅ **Eliminación** de unidades
- ✅ **Filtrado** por materia
- ✅ **Persistencia** en backend

## 🔒 Seguridad

- El profesor solo puede ver y editar sus propias unidades
- Validación de permisos basada en el ID del profesor
- Solo puede crear unidades para materias que tiene asignadas
