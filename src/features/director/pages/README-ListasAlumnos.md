# Listas de Alumnos - Arquitectura Modular

## 📁 Estructura de Archivos

### `/src/api/listas.js`
**Propósito**: Contiene todas las funciones de comunicación con el backend y procesamiento de datos.

**Funciones principales**:
- `processCSVFile(file)` - Procesa archivos CSV y extrae datos de alumnos
- `guardarListaAlumnos(listaData)` - Guarda una lista en el backend
- `obtenerListasAlumnos()` - Obtiene todas las listas guardadas
- `obtenerListaPorMateriaGrupo(materiaId, grupoId)` - Obtiene lista específica
- `actualizarListaAlumnos(listaId, alumnos)` - Actualiza una lista existente
- `eliminarListaAlumnos(listaId)` - Elimina una lista
- `descargarPlantillaCSV()` - Genera y descarga plantilla CSV
- `validarDatosLista(listaData)` - Valida datos antes de guardar

### `/src/hooks/useListasAlumnos.js`
**Propósito**: Hook personalizado que maneja toda la lógica de estado y efectos secundarios.

**Estados que maneja**:
- `listas` - Array de listas guardadas
- `materias` - Materias disponibles con sus grupos
- `gruposDisponibles` - Grupos filtrados por materia seleccionada
- `formData` - Datos del formulario (asignatura, grupo, profesor)
- `uploadedFile` - Archivo CSV cargado
- `processedAlumnos` - Datos procesados del CSV
- `loading/error/uploading` - Estados de carga y errores

**Funciones que expone**:
- `handleFileUpload(file)` - Maneja la carga y procesamiento de archivos
- `handleFormChange(field, value)` - Actualiza campos del formulario
- `handleSubmit()` - Procesa y guarda la lista completa
- `resetForm()` - Limpia el formulario
- `reloadData()` - Recarga datos desde el backend
- `downloadTemplate()` - Descarga plantilla CSV

### `/src/features/director/pages/ListasAlumnos.jsx`
**Propósito**: Componente de interfaz de usuario puro, enfocado solo en la presentación.

**Responsabilidades**:
- Renderizar la interfaz de usuario
- Manejar eventos de interacción (clicks, drag & drop)
- Mostrar estados de carga y errores
- Presentar datos en tablas y formularios

## 🔄 Flujo de Datos Actualizado

```
1. Usuario carga archivo CSV
   ↓
2. useListasAlumnos.handleFileUpload()
   ↓
3. listas.processCSVFile() - Procesa archivo localmente
   ↓
4. Hook actualiza estados (uploadedFile, processedAlumnos)
   ↓
5. Usuario completa formulario (materia, grupo) y envía
   ↓
6. useListasAlumnos.handleSubmit()
   ↓
7. Hook obtiene tutor_id del grupo seleccionado
   ↓
8. listas.validarDatosLista() - Valida datos incluyendo tutor_id
   ↓
9. listas.guardarListaAlumnos() - Convierte alumnos a CSV Blob
   ↓
10. Crea FormData con tutor_id, grupo_id y archivo CSV
   ↓
11. POST a http://localhost:3002/api/inscripciones/
    Content-Type: multipart/form-data
    req.body: { tutor_id, grupo_id }
    req.file: archivo CSV
   ↓
12. Hook actualiza lista local y limpia formulario
   ↓
13. Componente re-renderiza con nuevos datos
```

## 🎯 Beneficios de esta Arquitectura

### ✅ Separación de Responsabilidades
- **API Layer**: Solo se encarga de comunicación con backend y procesamiento de datos
- **Hook Layer**: Maneja lógica de estado y efectos secundarios
- **Component Layer**: Solo se encarga de presentación e interacción

### ✅ Reutilización
- El hook `useListasAlumnos` puede ser usado en otros componentes
- Las funciones de `listas.js` pueden ser llamadas desde cualquier parte de la app
- Lógica independiente de la interfaz de usuario

### ✅ Testabilidad
- Cada capa puede ser testeada de forma independiente
- Funciones puras en `listas.js` son fáciles de testear
- Hook puede ser testeado con `@testing-library/react-hooks`

### ✅ Mantenibilidad
- Cambios en la lógica de negocio solo afectan `listas.js`
- Cambios en el estado solo afectan `useListasAlumnos.js`
- Cambios en UI solo afectan `ListasAlumnos.jsx`

### ✅ Escalabilidad
- Fácil agregar nuevas funcionalidades sin tocar la UI
- Puede crecer agregando más funciones en `listas.js`
- El hook puede manejar más estados conforme crezcan los requerimientos

## 🔧 Uso del Hook

```jsx
// En cualquier componente
import { useListasAlumnos } from '../../../hooks/useListasAlumnos'

function MiComponente() {
  const {
    listas,           // Array de listas
    materias,         // Materias disponibles  
    loading,          // Estado de carga
    error,            // Errores
    handleSubmit,     // Función para guardar
    downloadTemplate  // Función para descargar plantilla
  } = useListasAlumnos()
  
  // Usar los datos y funciones...
}
```

## 🛠️ APIs Backend Utilizadas

El sistema integra con los siguientes endpoints:

### Endpoint Principal - Inscripciones
```
POST http://localhost:3002/api/inscripciones/
GET  http://localhost:3002/api/inscripciones/
```

### Estructura de Datos para POST

**Envío al servidor (FormData):**
```javascript
// FormData con archivo CSV
const formData = new FormData()
formData.append('tutor_id', '5')
formData.append('grupo_id', '12')
formData.append('csv', csvBlob, 'lista-alumnos.csv') // Archivo CSV como Blob
```

**Headers requeridos:**
```javascript
{
  'Content-Type': 'multipart/form-data'
}
```

**Contenido del archivo CSV:**
```csv
matricula,nombre
202401,Carlos Mendez
202402,Laura Jiménez
```

**En el backend se recibirá como:**
- `req.body.tutor_id` - ID del tutor/profesor
- `req.body.grupo_id` - ID del grupo
- `req.file` - Archivo CSV con los alumnos

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Inscripciones creadas exitosamente",
  "data": {
    "id": 1,
    "tutor_id": 5,
    "grupo_id": 12,
    "alumnos_count": 2
  }
}
```

### Endpoints de Materias (para obtener datos)
```
GET  http://3.214.92.57:3000/curso/cursos  (relaciones curso/grupos/profesores)
POST http://localhost:3002/api/materias/buscar-multiple (información de asignaturas)
GET  http://localhost:3001/personal (información de profesores)
```

## 📝 Formato de Datos

### CSV Esperado
```csv
Matricula,Nombre
202401,Carlos Mendez
202402,Laura Jiménez
```

### Objeto Lista
```javascript
{
  id: 1,
  materiaId: 5,
  grupoId: 2,
  asignatura: "Cálculo Diferencial",
  grupo: 1,
  profesor: "Dr. Juan Pérez",
  alumnos: [
    { matricula: "202401", nombre: "Carlos Mendez" },
    { matricula: "202402", nombre: "Laura Jiménez" }
  ]
}
```

## 🚀 Próximos Pasos

1. **Implementar endpoints en backend** para manejar las listas
2. **Agregar funcionalidades de edición** de listas existentes
3. **Implementar exportación** de listas a diferentes formatos
4. **Agregar validaciones avanzadas** (matrículas existentes, etc.)
5. **Implementar búsqueda y filtros** en las listas
