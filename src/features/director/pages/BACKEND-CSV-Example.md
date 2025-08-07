# Ejemplo de Backend para Recibir el Archivo CSV

## 📝 Endpoint: POST /api/inscripciones/

### Configuración del Middleware (Node.js/Express)

```javascript
const multer = require('multer')
const path = require('path')

// Configurar multer para recibir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/listas/') // Carpeta donde guardar los archivos
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueName = `lista-${Date.now()}-${Math.round(Math.random() * 1E9)}.csv`
    cb(null, uniqueName)
  }
})

// Filtrar solo archivos CSV
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos CSV'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
})

// Ruta del endpoint
app.post('/api/inscripciones/', upload.single('csv'), async (req, res) => {
  try {
    const { tutor_id, grupo_id } = req.body
    const csvFile = req.file
    
    console.log('📄 Datos recibidos:', {
      tutor_id,
      grupo_id,
      archivo: csvFile?.filename,
      path: csvFile?.path,
      size: csvFile?.size
    })
    
    // Validar que se recibieron todos los datos
    if (!tutor_id || !grupo_id || !csvFile) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: tutor_id, grupo_id, archivo CSV'
      })
    }
    
    // Leer y procesar el archivo CSV
    const fs = require('fs')
    const csvContent = fs.readFileSync(csvFile.path, 'utf8')
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',')
    
    const alumnos = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line) {
        const values = line.split(',')
        alumnos.push({
          matricula: values[0]?.trim(),
          nombre: values[1]?.trim()
        })
      }
    }
    
    console.log(`✅ CSV procesado: ${alumnos.length} alumnos encontrados`)
    
    // Aquí procesarías los alumnos según tu lógica de negocio
    // Por ejemplo, guardar en base de datos, validar matrículas, etc.
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Inscripciones creadas exitosamente',
      data: {
        id: Date.now(), // ID de la lista creada
        tutor_id: parseInt(tutor_id),
        grupo_id: parseInt(grupo_id),
        alumnos_count: alumnos.length,
        archivo_procesado: csvFile.filename
      }
    })
    
    // Opcional: Eliminar el archivo temporal después de procesarlo
    // fs.unlinkSync(csvFile.path)
    
  } catch (error) {
    console.error('💥 Error procesando inscripciones:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    })
  }
})
```

### Alternativa con Multer Memory Storage

```javascript
// Para mantener el archivo en memoria (no guardarlo en disco)
const memoryStorage = multer.memoryStorage()

const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
})

app.post('/api/inscripciones/', uploadMemory.single('csv'), async (req, res) => {
  try {
    const { tutor_id, grupo_id } = req.body
    const csvFile = req.file
    
    // El archivo está en memoria como Buffer
    const csvContent = csvFile.buffer.toString('utf8')
    
    // Procesar el contenido...
    
  } catch (error) {
    // Manejo de errores...
  }
})
```

## 🔧 Configuración del Frontend

El frontend ahora envía:
```javascript
// FormData que se crea automáticamente
FormData {
  tutor_id: "5",           // string
  grupo_id: "12",          // string  
  csv: [File object]       // archivo CSV como Blob
}
```

## ✅ Beneficios de esta Implementación

1. **Eficiencia**: No se parsea el CSV en el frontend
2. **Flexibilidad**: El backend puede procesar el CSV como prefiera
3. **Estándar**: Uso de multipart/form-data estándar
4. **Escalabilidad**: Funciona con archivos de cualquier tamaño
5. **Reutilización**: El archivo se puede guardar para auditoría
