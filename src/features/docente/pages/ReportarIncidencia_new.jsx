import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
  Chip,
  Paper,
  Avatar,
  CircularProgress,
  Divider
} from '@mui/material'
import { 
  Send as SendIcon, 
  Report as ReportIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { getAlumnosByTutor, createIncidencia, getIncidenciasByTutor } from '../../../api/incidencias.js'

export default function ReportarIncidencia() {
  const [formData, setFormData] = useState({
    matricula_estudiante: '',
    materia_id: '',
    tipoDeIntervencion: '',
    descripcion: ''
  })
  
  const [alumnos, setAlumnos] = useState([])
  const [intervenciones, setIntervenciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [errors, setErrors] = useState({})
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const tiposIntervencion = [
    'ACADEMICA',
    'CONDUCTUAL', 
    'ASISTENCIA',
    'PERSONAL'
  ]

  const loadInitialData = async () => {
    try {
      setLoadingData(true)
      const docenteId = localStorage.getItem('userID')
      
      if (!docenteId) {
        throw new Error('ID del docente no encontrado')
      }

      console.log('🔄 Cargando datos iniciales para docente:', docenteId)

      const [alumnosData, intervencionesData] = await Promise.all([
        getAlumnosByTutor(docenteId).catch(() => []),
        getIncidenciasByTutor(docenteId).catch(() => [])
      ])

      setAlumnos(alumnosData)
      setIntervenciones(intervencionesData)

      console.log('✅ Datos cargados:', {
        alumnos: alumnosData.length,
        intervenciones: intervencionesData.length
      })

    } catch (error) {
      console.error('💥 Error cargando datos iniciales:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar los datos iniciales',
        severity: 'error'
      })
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar errores del campo modificado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.matricula_estudiante) {
      newErrors.matricula_estudiante = 'Debe seleccionar un estudiante'
    }
    
    if (!formData.tipoDeIntervencion) {
      newErrors.tipoDeIntervencion = 'Debe seleccionar el tipo de intervención'
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Por favor corrige los errores en el formulario',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)
      const docenteId = localStorage.getItem('userID')
      
      const intervencionData = {
        ...formData,
        tutor_id: docenteId,
        fecha: new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE'
      }

      console.log('📤 Enviando intervención:', intervencionData)

      await createIncidencia(intervencionData)
      
      setSnackbar({
        open: true,
        message: 'Intervención registrada exitosamente',
        severity: 'success'
      })

      // Limpiar formulario
      setFormData({
        matricula_estudiante: '',
        materia_id: '',
        tipoDeIntervencion: '',
        descripcion: ''
      })
      setErrors({})

      // Recargar intervenciones
      await loadInitialData()

    } catch (error) {
      console.error('💥 Error al registrar intervención:', error)
      setSnackbar({
        open: true,
        message: 'Error al registrar la intervención',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'ACADEMICA': return 'primary'
      case 'CONDUCTUAL': return 'warning'
      case 'ASISTENCIA': return 'error'
      case 'PERSONAL': return 'info'
      default: return 'default'
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'warning'
      case 'EN_PROCESO': return 'info'
      case 'RESUELTO': return 'success'
      case 'CERRADO': return 'default'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ReportIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Gestión de Intervenciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Registra y gestiona intervenciones académicas y disciplinarias
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={loadingData ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={loadInitialData}
          disabled={loadingData}
        >
          {loadingData ? 'Cargando...' : 'Actualizar'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Formulario de Nueva Intervención */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Nueva Intervención
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  
                  {/* Estudiante */}
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Estudiante"
                      value={formData.matricula_estudiante}
                      onChange={(e) => handleInputChange('matricula_estudiante', e.target.value)}
                      error={!!errors.matricula_estudiante}
                      helperText={errors.matricula_estudiante}
                      fullWidth
                      required
                      disabled={loadingData}
                    >
                      {alumnos.map(alumno => (
                        <MenuItem key={alumno.matricula} value={alumno.matricula}>
                          {alumno.nombre} - {alumno.matricula}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Tipo de Intervención */}
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Tipo de Intervención"
                      value={formData.tipoDeIntervencion}
                      onChange={(e) => handleInputChange('tipoDeIntervencion', e.target.value)}
                      error={!!errors.tipoDeIntervencion}
                      helperText={errors.tipoDeIntervencion}
                      fullWidth
                      required
                    >
                      {tiposIntervencion.map(tipo => (
                        <MenuItem key={tipo} value={tipo}>
                          {tipo}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Descripción */}
                  <Grid item xs={12}>
                    <TextField
                      label="Descripción de la Intervención"
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      error={!!errors.descripcion}
                      helperText={errors.descripcion}
                      fullWidth
                      required
                      multiline
                      rows={4}
                      placeholder="Describe detalladamente la situación y las acciones tomadas..."
                    />
                  </Grid>

                  {/* Botón de envío */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="warning"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      disabled={loading || loadingData}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {loading ? 'Registrando...' : 'Registrar Intervención'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Intervenciones */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 600 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Intervenciones Registradas
                </Typography>
                <Chip 
                  label={`${intervenciones.length} registros`}
                  color="info"
                  variant="outlined"
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {loadingData ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : intervenciones.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <WarningIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay intervenciones registradas
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {intervenciones.map((intervencion, index) => (
                      <Paper 
                        key={intervencion.id || index} 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: `${getTipoColor(intervencion.tipo)}.main`, 
                            width: 40, 
                            height: 40 
                          }}>
                            <PersonIcon />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {intervencion.estudiante?.nombre || 'Estudiante desconocido'}
                              </Typography>
                              <Chip 
                                label={intervencion.tipo || 'Sin tipo'} 
                                size="small" 
                                color={getTipoColor(intervencion.tipo)}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Mat: {intervencion.estudiante?.matricula || 'Sin matrícula'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              {intervencion.descripcion || 'Sin descripción'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {intervencion.fecha || 'Fecha no disponible'}
                              </Typography>
                              <Chip 
                                label={intervencion.estado || 'PENDIENTE'} 
                                size="small" 
                                color={getEstadoColor(intervencion.estado)}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
