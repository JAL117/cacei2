import { useCallback } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Paper, 
  TextField, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useListasAlumnos } from '../../../hooks/useListasAlumnos'

export default function ListasAlumnos() {
  // Usar el hook personalizado para manejar toda la lógica
  const {
    listas,
    materias,
    gruposDisponibles,
    formData,
    uploadedFile,
    processedAlumnos,
    loading,
    error,
    uploading,
    isFormValid,
    isFormDisabled,
    handleFileUpload,
    handleFormChange,
    handleSubmit,
    resetForm,
    reloadData,
    downloadTemplate,
    setError
  } = useListasAlumnos()

  // Configuración del dropzone
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  })

  // Manejar envío del formulario
  const onSubmit = async (e) => {
    e.preventDefault()
    
    const resultado = await handleSubmit()
    
    if (resultado.success) {
      // Aquí se podría mostrar un mensaje de éxito
      console.log('✅ Lista guardada exitosamente')
    }
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando materias...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={reloadData}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
     
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Listas de Alumnos por Asignatura
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Carga las listas de alumnos para cada asignatura y grupo ({materias.length} materias disponibles)
        </Typography>
      </Box>

      {materias.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No hay materias configuradas. Primero ve a "Asignar Materias" para configurar las materias y sus grupos.
        </Alert>
      )}


      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Subir Lista de Alumnos
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

          <form onSubmit={onSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                select
                label="Seleccionar asignatura"
                value={formData.asignatura}
                onChange={(e) => handleFormChange('asignatura', e.target.value)}
                required
                fullWidth
                disabled={isFormDisabled}
              >
                {materias.map((materia) => (
                  <MenuItem key={materia.id} value={materia.id}>
                    {materia.nombre} - Cuatrimestre {materia.cuatrimestre}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Seleccionar grupo"
                value={formData.grupo}
                onChange={(e) => handleFormChange('grupo', e.target.value)}
                required
                fullWidth
                disabled={!formData.asignatura || gruposDisponibles.length === 0}
              >
                {gruposDisponibles.map((grupo) => (
                  <MenuItem key={grupo.id} value={grupo.id}>
                    Grupo {grupo.numero} - {
                      typeof grupo.profesor === 'object' 
                        ? `${grupo.profesor.nombre} ${grupo.profesor.apellido || ''}`.trim()
                        : grupo.profesor || 'Sin profesor asignado'
                    }
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {formData.profesor && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                <Typography variant="body2" color="primary.main">
                  <strong>Profesor asignado:</strong> {formData.profesor}
                </Typography>
              </Box>
            )}

            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 3,
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: isDragActive ? 'primary.lighter' : 'grey.50',
                mb: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.lighter',
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              {uploadedFile ? (
                <Box>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Archivo seleccionado: {uploadedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamaño: {(uploadedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                  {processedAlumnos.length > 0 && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      ✅ {processedAlumnos.length} alumnos procesados
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {isDragActive ? 'Suelta el archivo CSV aquí' : 'Arrastra tu archivo CSV aquí'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    o haz clic para seleccionar un archivo
                  </Typography>
                  {uploading && (
                    <Box sx={{ mt: 2 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Procesando archivo...
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>

            <Button
              type="submit"
              variant="contained"
              disabled={!isFormValid || uploading}
              sx={{ borderRadius: 2 }}
            >
              {uploading ? 'Guardando...' : 'Subir Lista'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mostrar información sobre las listas cargadas */}
      {listas.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Listas de Alumnos Registradas ({listas.length})
          </Typography>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          Se han subido las listas de alumnos.
        </Alert>
      )}

      {listas.map((lista, index) => (
        <Card key={index} sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', mb: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="bold">
                {lista.asignatura} - Grupo {lista.grupo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profesor: {lista.profesor || 'Sin profesor asignado'} • {lista.alumnos?.length || 0} alumnos registrados
              </Typography>
              {lista.tutor_id && (
                <Typography variant="body2" color="primary.main" sx={{ mt: 0.5 }}>
                  📚 Mostrando tutorados reales del tutor (ID: {lista.tutor_id})
                </Typography>
              )}
              {!lista.tutor_id && lista.alumnos_csv?.length > 0 && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
                  📄 Mostrando alumnos del archivo CSV ({lista.alumnos_csv.length} en archivo)
                </Typography>
              )}
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Matrícula</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grupo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lista.alumnos && lista.alumnos.length > 0 ? (
                    lista.alumnos.map((alumno, alumnoIndex) => (
                      <TableRow key={`${lista.id || index}-${alumno.matricula || alumnoIndex}`}>
                        <TableCell>{alumno.matricula || 'N/A'}</TableCell>
                        <TableCell>{alumno.nombre || 'N/A'}</TableCell>
                        <TableCell>{alumno.grupo || 'N/A'}</TableCell>
                        <TableCell>
                          {lista.tutor_id ? (
                            <Typography variant="body2" color="success.main">
                              🟢 Registrado en BD
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="info.main">
                              📄 Desde CSV
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 2, color: 'text.secondary' }}>
                        No hay alumnos registrados en esta lista
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
