import { useState, useCallback, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import GetAppIcon from '@mui/icons-material/GetApp'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'

// Importar las funciones actualizadas del API
const API_BASE_URL = 'http://localhost:3002'

// Función para obtener alumnos con mejor manejo de errores
const getAlumnos = async () => {
  try {
    console.log('🔍 Frontend: Solicitando alumnos desde:', `${API_BASE_URL}/alumnos/listar`)
    
    const response = await fetch(`${API_BASE_URL}/alumnos/listar`)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ Frontend: No hay alumnos registrados (404)')
        return []
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    console.log('📊 Frontend: Respuesta recibida:', {
      hasSuccess: data.hasOwnProperty('success'),
      success: data.success,
      hasData: data.hasOwnProperty('data'),
      dataLength: data.data ? data.data.length : 0
    })
    
    // Si la respuesta tiene estructura { success: true, data: [...] }
    if (data.success === true && Array.isArray(data.data)) {
      console.log('✅ Frontend: Alumnos obtenidos exitosamente:', data.data.length)
      return data.data
    }
    
    // Si la respuesta es directamente un array
    if (Array.isArray(data)) {
      console.log('✅ Frontend: Alumnos obtenidos (array directo):', data.length)
      return data
    }
    
    // Si no hay datos válidos
    console.log('ℹ️ Frontend: No se encontraron datos válidos')
    return []
    
  } catch (error) {
    console.error('💥 Frontend: Error al obtener alumnos:', error)
    return []
  }
}

// Función para cargar CSV
const uploadAlumnosCSV = async (file, onProgress = null) => {
  try {
    console.log('🔍 Frontend: Iniciando carga de CSV:', file.name)
    
    const formData = new FormData()
    formData.append('archivo', file)
    
    const response = await fetch(`${API_BASE_URL}/alumnos/cargar-csv`, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    console.log('📊 Frontend: Resultado de carga CSV:', result)
    
    if (response.ok) {
      return {
        success: true,
        data: result,
        message: `Archivo procesado: ${result.successfullyProcessed || 0} de ${result.totalRows || 0} registros guardados exitosamente`
      }
    } else {
      return {
        success: false,
        message: result.message || 'Error al procesar el archivo',
        errors: result.errors || []
      }
    }
  } catch (error) {
    console.error('💥 Frontend: Error al cargar CSV:', error)
    return {
      success: false,
      message: 'Error inesperado al cargar el archivo.'
    }
  }
}

// Función para validar archivo CSV
const validateCSVFile = (file) => {
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
    return {
      valid: false,
      message: 'Formato de archivo no válido. Solo se permiten archivos CSV.'
    }
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
    }
  }
  
  return {
    valid: true,
    message: 'Archivo válido'
  }
}

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [filteredAlumnos, setFilteredAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar alumnos al montar el componente
  useEffect(() => {
    loadAlumnos()
  }, [])

  // Filtrar alumnos cuando cambie el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAlumnos(alumnos)
    } else {
      const filtered = alumnos.filter(alumno => 
        alumno.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.carrera?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.materia?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAlumnos(filtered)
    }
  }, [searchTerm, alumnos])

  const loadAlumnos = async () => {
    try {
      setLoading(true)
      console.log('🔄 Frontend: Cargando alumnos...')
      
      const data = await getAlumnos()
      console.log('📊 Frontend: Datos obtenidos:', data.length, 'alumnos')
      
      setAlumnos(data)
      setFilteredAlumnos(data)
      
      if (data.length > 0) {
        showSnackbar(`Se cargaron ${data.length} alumnos exitosamente`, 'success')
      } else {
        showSnackbar('No hay alumnos registrados aún', 'info')
      }
    } catch (error) {
      console.error('💥 Frontend: Error al cargar alumnos:', error)
      showSnackbar('Error al cargar los datos de alumnos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const downloadTemplate = async () => {
    try {
      const headers = [
        'Matricula',
        'Nombre',
        'Carrera',
        'EstatusAlumno',
        'CuatrimestreActual',
        'GrupoActual',
        'Materia',
        'Periodo',
        'EstatusMateria',
        'Final',
        'Extra',
        'EstatusCardex',
        'PeriodoCursado',
        'PlanEstudiosClave',
        'Creditos',
        'TutorAcademico'
      ]
      
      const exampleRow = [
        '223258',
        'Juan Pérez',
        'Ingeniería en Sistemas',
        'Activo',
        '5',
        'A',
        'Cálculo Diferencial',
        'ENERO-ABRIL 2024',
        'Cursando',
        '85',
        'N/A',
        'Vigente',
        'ENERO-ABRIL 2024',
        'ISC-2020',
        '8',
        'Dr. María García'
      ]
      
      const csvContent = [
        headers.join(','),
        exampleRow.join(',')
      ].join('\\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'plantilla_alumnos.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      showSnackbar('Plantilla descargada exitosamente')
    } catch (error) {
      showSnackbar('Error al descargar la plantilla', 'error')
    }
  }

  const exportData = async () => {
    try {
      const headers = [
        'Matricula',
        'Nombre',
        'Carrera',
        'EstatusAlumno',
        'CuatrimestreActual',
        'GrupoActual',
        'Materia',
        'Periodo',
        'EstatusMateria',
        'Final',
        'Extra',
        'EstatusCardex',
        'PeriodoCursado',
        'PlanEstudiosClave',
        'Creditos',
        'TutorAcademico'
      ]
      
      const csvData = [
        headers.join(','),
        ...filteredAlumnos.map(alumno => 
          headers.map(header => {
            let value = ''
            
            switch (header) {
              case 'Matricula': value = alumno.matricula || ''; break
              case 'Nombre': value = alumno.nombre || ''; break
              case 'Carrera': value = alumno.carrera || ''; break
              case 'EstatusAlumno': value = alumno.estatusAlumno || ''; break
              case 'CuatrimestreActual': value = alumno.cuatrimestreActual || ''; break
              case 'GrupoActual': value = alumno.grupoActual || ''; break
              case 'Materia': value = alumno.materia || ''; break
              case 'Periodo': value = alumno.periodo || ''; break
              case 'EstatusMateria': value = alumno.estatusMateria || ''; break
              case 'Final': value = alumno.final || ''; break
              case 'Extra': value = alumno.extra || ''; break
              case 'EstatusCardex': value = alumno.estatusCardex || ''; break
              case 'PeriodoCursado': value = alumno.periodoCursado || ''; break
              case 'PlanEstudiosClave': value = alumno.planEstudiosClave || ''; break
              case 'Creditos': value = alumno.creditos || ''; break
              case 'TutorAcademico': value = alumno.tutorAcademico || ''; break
              default: value = ''; break
            }
            
            return `"${value}"`
          }).join(',')
        )
      ].join('\\n')
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', 'datos_alumnos.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      showSnackbar('Datos exportados exitosamente')
    } catch (error) {
      showSnackbar('Error al exportar los datos', 'error')
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    
    const validation = validateCSVFile(file)
    if (!validation.valid) {
      showSnackbar(validation.message, 'error')
      return
    }
    
    setUploadedFile(file)
    showSnackbar('Archivo válido seleccionado', 'success')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  })

  const handleProcessFile = async () => {
    if (!uploadedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const result = await uploadAlumnosCSV(uploadedFile, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success) {
        // Recargar los datos desde la API después de una carga exitosa
        await loadAlumnos()
        showSnackbar(result.message || 'Archivo procesado exitosamente', 'success')
        setUploadedFile(null)
      } else {
        showSnackbar(result.message || 'Error al procesar el archivo', 'error')
        if (result.errors && result.errors.length > 0) {
          console.error('Errores de validación:', result.errors)
        }
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error)
      showSnackbar('Error inesperado al procesar el archivo', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const allColumns = [
    { id: 'matricula', label: 'Matrícula' },
    { id: 'nombre', label: 'Nombre' },
    { id: 'carrera', label: 'Carrera' },
    { id: 'estatusAlumno', label: 'Estatus Alumno' },
    { id: 'cuatrimestreActual', label: 'Cuatrimestre' },
    { id: 'grupoActual', label: 'Grupo' },
    { id: 'materia', label: 'Materia' },
    { id: 'periodo', label: 'Periodo' },
    { id: 'estatusMateria', label: 'Estatus Materia' },
    { id: 'final', label: 'Final' },
    { id: 'extra', label: 'Extra' },
    { id: 'estatusCardex', label: 'Estatus Cardex' },
    { id: 'periodoCursado', label: 'Periodo Cursado' },
    { id: 'planEstudiosClave', label: 'Plan de Estudios' },
    { id: 'creditos', label: 'Créditos' },
    { id: 'tutorAcademico', label: 'Tutor Académico' },
  ]

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'inscrito':
      case 'aprobada':
      case 'aprobado':
      case 'vigente':
      case 'ordinario':
        return 'success'
      case 'cursando':
        return 'primary'
      case 'inactivo':
      case 'reprobada':
      case 'reprobado':
      case 'baja académica':
        return 'error'
      case 'sin cursar':
        return 'default'
      default:
        return 'default'
    }
  }

  const renderTable = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Cargando alumnos...</Typography>
        </Box>
      )
    }

    if (filteredAlumnos.length === 0 && alumnos.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" variant="h6">
            No hay alumnos registrados
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            Sube un archivo CSV para comenzar a importar datos de estudiantes
          </Typography>
        </Box>
      )
    }

    if (filteredAlumnos.length === 0 && searchTerm) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No se encontraron alumnos que coincidan con "{searchTerm}"
          </Typography>
        </Box>
      )
    }

    return (
      <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {allColumns.map((column) => (
                <TableCell 
                  key={column.id} 
                  sx={{ 
                    fontWeight: 'bold', 
                    bgcolor: 'primary.main',
                    color: 'white',
                    minWidth: column.id === 'nombre' ? 200 : 
                             column.id === 'carrera' ? 180 :
                             column.id === 'planEstudiosClave' ? 150 :
                             column.id === 'tutorAcademico' ? 160 :
                             column.id === 'materia' ? 150 : 120,
                    whiteSpace: 'nowrap',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    fontSize: '0.875rem'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlumnos.map((alumno, index) => (
              <TableRow 
                key={`${alumno.matricula}-${alumno.id || index}`}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover' 
                  },
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                {allColumns.map((column) => (
                  <TableCell 
                    key={column.id}
                    sx={{ 
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                      padding: '8px 12px'
                    }}
                  >
                    {['estatusAlumno', 'estatusMateria', 'estatusCardex'].includes(column.id) ? (
                      <Chip 
                        label={alumno[column.id] || 'N/A'} 
                        color={getStatusColor(alumno[column.id])}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ) : (
                      alumno[column.id] || 'N/A'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Datos de Alumnos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Importa y gestiona la información estudiantil completa
        </Typography>
      </Box>

      {/* Upload Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Subir Datos de Alumnos
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              sx={{ borderRadius: 2 }}
            >
              Descargar Plantilla
            </Button>
          </Box>

          {/* Format Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="info.main" gutterBottom>
              Formato requerido del CSV:
            </Typography>
            <Typography variant="body2" color="info.main" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              Matricula, Nombre, Carrera, EstatusAlumno, CuatrimestreActual, GrupoActual, 
              Materia, Periodo, EstatusMateria, Final, Extra, EstatusCardex, 
              PeriodoCursado, PlanEstudiosClave, Creditos, TutorAcademico
            </Typography>
          </Box>

          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 3,
              cursor: uploading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              backgroundColor: isDragActive ? 'primary.lighter' : 'grey.50',
              transition: 'all 0.3s ease',
              opacity: uploading ? 0.7 : 1,
              '&:hover': {
                borderColor: uploading ? 'grey.300' : 'primary.main',
                backgroundColor: uploading ? 'grey.50' : 'primary.lighter',
              }
            }}
          >
            <input {...getInputProps()} disabled={uploading} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            {uploading ? (
              <Box>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  Subiendo archivo...
                </Typography>
                <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {uploadProgress}% completado
                </Typography>
              </Box>
            ) : uploadedFile ? (
              <Box>
                <Typography variant="h6" color="primary.main" gutterBottom>
                  Archivo seleccionado: {uploadedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tamaño: {(uploadedFile.size / 1024).toFixed(2)} KB
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleProcessFile}
                  disabled={uploading}
                  sx={{ mt: 2, borderRadius: 2 }}
                  startIcon={uploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
                >
                  {uploading ? 'Procesando...' : 'Procesar Archivo'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo CSV aquí'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  o haz clic para seleccionar un archivo
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Formatos soportados: CSV (máx. 10MB)
                </Typography>
              </Box>
            )}
          </Paper>
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Alumnos Registrados ({filteredAlumnos.length})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? `Mostrando resultados para "${searchTerm}"` : 'Información completa de todos los estudiantes'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Recargar datos">
                  <IconButton
                    onClick={loadAlumnos}
                    color="primary"
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Exportar datos a CSV">
                  <IconButton
                    onClick={exportData}
                    color="primary"
                    sx={{ 
                      bgcolor: 'primary.lighter',
                      '&:hover': { bgcolor: 'primary.light' }
                    }}
                  >
                    <GetAppIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Search Field */}
            <TextField
              placeholder="Buscar por matrícula, nombre, carrera o materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          </Box>
          
          <Box sx={{ overflow: 'auto' }}>
            {renderTable()}
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
