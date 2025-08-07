import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  MenuItem,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Alert,
  AlertTitle,
  CircularProgress,
  Autocomplete
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import SaveIcon from '@mui/icons-material/Save'
import GetAppIcon from '@mui/icons-material/GetApp'
import GroupIcon from '@mui/icons-material/Group'
import BookIcon from '@mui/icons-material/Book'
import PersonIcon from '@mui/icons-material/Person'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CancelIcon from '@mui/icons-material/Cancel'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import HistoryIcon from '@mui/icons-material/History'
import DescriptionIcon from '@mui/icons-material/Description'
import SchoolIcon from '@mui/icons-material/School'
import RefreshIcon from '@mui/icons-material/Refresh'
import BuildIcon from '@mui/icons-material/Build'
import { format } from 'date-fns'

// Importar las nuevas APIs para tutorados
import {
  getTutoresDisponibles,
  getTutoradosByTutor,
  getListaAsistencia,
  pasarLista,
  getHistorialAsistencias,
  validarDatosAsistencia,
  generarCSVTutorados,
  descargarCSVLocal,
  mapEstadoToFrontend,
  crearDatosPrueba
} from '../../../api/asistencia'

export default function ListasAsistenciaTutorados() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [listType, setListType] = useState('tutorados') // Por defecto tutorados
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [tutoresDisponibles, setTutoresDisponibles] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [listGenerated, setListGenerated] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const attendanceStates = {
    present: { label: 'Presente', color: 'success', icon: CheckCircleIcon },
    late: { label: 'Retardo', color: 'warning', icon: AccessTimeIcon },
    absent: { label: 'Ausente', color: 'error', icon: CancelIcon },
    excuse: { label: 'Justificado', color: 'info', icon: VerifiedUserIcon }
  }

  // Cargar tutores disponibles al montar el componente
  useEffect(() => {
    const loadTutores = async () => {
      try {
        const tutores = await getTutoresDisponibles()
        setTutoresDisponibles(tutores)
      } catch (error) {
        console.error('Error al cargar tutores:', error)
        setSnackbar({
          open: true,
          message: 'Error al cargar la lista de tutores',
          severity: 'error'
        })
      }
    }

    loadTutores()
  }, [])

  // Cargar historial cuando se selecciona un tutor
  useEffect(() => {
    if (selectedTutor) {
      loadHistorialAsistencias()
    }
  }, [selectedTutor])

  const loadHistorialAsistencias = async () => {
    if (!selectedTutor) return

    try {
      setLoading(true)
      const historial = await getHistorialAsistencias(selectedTutor.id)
      setAttendanceHistory(historial.historial || [])
    } catch (error) {
      console.error('Error al cargar historial:', error)
      setSnackbar({
        open: true,
        message: 'Error al cargar el historial de asistencias',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const generateList = async () => {
    if (!selectedTutor) {
      setSnackbar({
        open: true,
        message: 'Por favor selecciona un tutor académico',
        severity: 'warning'
      })
      return
    }

    try {
      setLoading(true)
      
      // Obtener tutorados del tutor seleccionado
      const response = await getTutoradosByTutor(selectedTutor.id)
      
      if (response.tutorados.length === 0) {
        setSnackbar({
          open: true,
          message: `No se encontraron tutorados para ${selectedTutor.nombre}`,
          severity: 'warning'
        })
        setStudents([])
        setListGenerated(false)
        return
      }

      // Formatear estudiantes para la interfaz
      const estudiantesFormateados = response.tutorados.map(tutorado => ({
        id: tutorado.id,
        matricula: tutorado.matricula,
        nombre: tutorado.nombre,
        carrera: tutorado.carrera,
        cuatrimestre: tutorado.cuatrimestre_actual,
        grupo: tutorado.grupo_actual,
        estatus: tutorado.estatus
      }))

      setStudents(estudiantesFormateados)
      
      // Verificar si ya existe una lista para esta fecha
      const fechaFormateada = format(selectedDate, 'yyyy-MM-dd')
      const listaExistente = await getListaAsistencia(selectedTutor.id, fechaFormateada)
      
      // Inicializar asistencias
      const initialAttendance = {}
      
      if (listaExistente.asistencias_existentes && listaExistente.asistencias_existentes.length > 0) {
        // Si hay asistencias previas, cargarlas
        listaExistente.asistencias_existentes.forEach(asistencia => {
          const estudiante = estudiantesFormateados.find(e => e.matricula === asistencia.matricula_estudiante)
          if (estudiante) {
            initialAttendance[estudiante.id] = mapEstadoToFrontend(asistencia.estado)
          }
        })
        
        // Completar con 'present' para estudiantes sin registro previo
        estudiantesFormateados.forEach(student => {
          if (!initialAttendance[student.id]) {
            initialAttendance[student.id] = 'present'
          }
        })
        
        setSnackbar({
          open: true,
          message: 'Se cargó una lista de asistencia existente para esta fecha',
          severity: 'info'
        })
      } else {
        // Lista nueva, todos marcados como presentes por defecto
        estudiantesFormateados.forEach(student => {
          initialAttendance[student.id] = 'present'
        })
      }
      
      setAttendance(initialAttendance)
      setListGenerated(true)
      
      setSnackbar({
        open: true,
        message: `Lista generada: ${response.total_tutorados} tutorados encontrados`,
        severity: 'success'
      })
      
    } catch (error) {
      console.error('Error al generar lista:', error)
      setSnackbar({
        open: true,
        message: 'Error al generar la lista de asistencia',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSaveAttendance = async () => {
    if (!selectedTutor) {
      setSnackbar({
        open: true,
        message: 'Error: No hay tutor seleccionado',
        severity: 'error'
      })
      return
    }

    try {
      setLoading(true)
      
      // Preparar datos para el backend
      const registros = students.map(student => ({
        matricula: student.matricula,
        estado: attendance[student.id] || 'present',
        observaciones: ''
      }))

      const asistenciaData = {
        fecha: format(selectedDate, 'yyyy-MM-dd'),
        tutorId: selectedTutor.id,
        registros
      }

      // Validar datos antes de enviar
      const validacion = validarDatosAsistencia(asistenciaData)
      if (!validacion.valido) {
        setSnackbar({
          open: true,
          message: `Error de validación: ${validacion.errores.join(', ')}`,
          severity: 'error'
        })
        return
      }

      // Enviar al backend
      const resultado = await pasarLista(selectedTutor.id, asistenciaData)
      
      if (resultado.success) {
        setSnackbar({
          open: true,
          message: 'Lista de asistencia guardada correctamente',
          severity: 'success'
        })
        
        // Recargar historial
        await loadHistorialAsistencias()
        
        // Resetear formulario
        resetForm()
      } else {
        setSnackbar({
          open: true,
          message: resultado.message || 'Error al guardar la asistencia',
          severity: 'error'
        })
      }
      
    } catch (error) {
      console.error('Error al guardar asistencia:', error)
      setSnackbar({
        open: true,
        message: 'Error al guardar la lista de asistencia',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar({ ...snackbar, open: false })
  }
  
  const resetForm = () => {
    setStudents([])
    setAttendance({})
    setListGenerated(false)
  }

  const exportToCSV = () => {
    if (!selectedTutor || students.length === 0) {
      setSnackbar({
        open: true,
        message: 'No hay datos para exportar',
        severity: 'warning'
      })
      return
    }

    try {
      // Preparar datos para CSV
      const registros = students.map(student => ({
        matricula: student.matricula,
        nombre: student.nombre,
        carrera: student.carrera,
        cuatrimestre: student.cuatrimestre,
        grupo: student.grupo,
        estado: attendance[student.id] || 'present',
        observaciones: ''
      }))

      const asistenciaData = {
        fecha: format(selectedDate, 'yyyy-MM-dd'),
        tutorId: selectedTutor.id,
        registros
      }

      const csvContent = generarCSVTutorados(asistenciaData, selectedTutor.nombre)
      const filename = `asistencia_tutorados_${selectedTutor.id}_${format(selectedDate, 'yyyy-MM-dd')}.csv`
      
      descargarCSVLocal(csvContent, filename)
      
      setSnackbar({
        open: true,
        message: 'Lista exportada correctamente en formato CSV',
        severity: 'info'
      })
    } catch (error) {
      console.error('Error al exportar:', error)
      setSnackbar({
        open: true,
        message: 'Error al exportar la lista',
        severity: 'error'
      })
    }
  }

  const getAttendanceStats = () => {
    const total = students.length
    const present = Object.values(attendance).filter(status => status === 'present').length
    const late = Object.values(attendance).filter(status => status === 'late').length
    const absent = Object.values(attendance).filter(status => status === 'absent').length
    const excuse = Object.values(attendance).filter(status => status === 'excuse').length
    
    return { total, present, late, absent, excuse }
  }

  const renderAttendanceForm = () => (
    <Box>
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            Configurar Lista de Asistencia - Alumnos
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={tutoresDisponibles}
                getOptionLabel={(option) => `${option.nombre} (${option.id})`}
                value={selectedTutor}
                onChange={(event, newValue) => {
                  setSelectedTutor(newValue)
                  resetForm()
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar"
                    required
                    helperText="Seleccionar"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {option.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {option.id}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={generateList}
                  disabled={!selectedTutor || loading}
                  size="large"
                  sx={{ borderRadius: 3 }}
                  startIcon={loading ? <CircularProgress size={20} /> : <PersonIcon />}
                >
                  {loading ? 'Cargando...' : 'Generar Lista'}
                </Button>
                
                {selectedTutor && (
                  <Button
                    variant="outlined"
                    onClick={loadHistorialAsistencias}
                    disabled={loading}
                    size="large"
                    sx={{ borderRadius: 3 }}
                    startIcon={<RefreshIcon />}
                  >
                    Actualizar Historial
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCreateTestData}
                  disabled={loading}
                  size="large"
                  sx={{ borderRadius: 3 }}
                  startIcon={loading ? <CircularProgress size={20} /> : <BuildIcon />}
                >
                  {loading ? 'Creando...' : 'Crear Datos de Prueba'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {listGenerated && students.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                <Typography variant="h4" color="primary">
                  {getAttendanceStats().total}
                </Typography>
                <Typography variant="body2">Total</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                <Typography variant="h4" color="success.main">
                  {getAttendanceStats().present}
                </Typography>
                <Typography variant="body2">Presentes</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                <Typography variant="h4" color="warning.main">
                  {getAttendanceStats().late}
                </Typography>
                <Typography variant="body2">Retardos</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                <Typography variant="h4" color="error.main">
                  {getAttendanceStats().absent}
                </Typography>
                <Typography variant="body2">Ausentes</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                <Typography variant="h4" color="info.main">
                  {getAttendanceStats().excuse}
                </Typography>
                <Typography variant="body2">Justificados</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Tabla de asistencia */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  📋 Lista de Asistencia - {format(selectedDate, 'dd/MM/yyyy')} - 
                  {selectedTutor ? ` ${selectedTutor.nombre}` : ''}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={exportToCSV}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 'medium',
                      '&:hover': {
                        backgroundColor: 'info.50'
                      }
                    }}
                  >
                    Exportar CSV
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSaveAttendance}
                    disabled={loading}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 'medium',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                      }
                    }}
                  >
                    {loading ? 'Guardando...' : 'Guardar Asistencia'}
                  </Button>
                </Box>
              </Box>
              
              <Paper sx={{ 
                width: '100%', 
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Matrícula
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Nombre
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Carrera
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Cuatrimestre
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Grupo
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Estado
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student, idx) => {
                        const currentState = attendance[student.id]
                        const StateIcon = attendanceStates[currentState]?.icon || CheckCircleIcon
                        
                        return (
                          <TableRow 
                            key={student.id}
                            sx={{
                              '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                              '&:hover': { backgroundColor: 'action.selected' },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>
                              {student.matricula}
                            </TableCell>
                            <TableCell>
                              {student.nombre}
                            </TableCell>
                            <TableCell>
                              {student.carrera}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${student.cuatrimestre}°`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={student.grupo}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={<StateIcon />}
                                label={attendanceStates[currentState]?.label || 'No definido'}
                                color={attendanceStates[currentState]?.color || 'default'}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                {Object.entries(attendanceStates).map(([key, state]) => {
                                  const StateIcon = state.icon
                                  return (
                                    <IconButton
                                      key={key}
                                      size="small"
                                      color={currentState === key ? state.color : 'default'}
                                      onClick={() => handleAttendanceChange(student.id, key)}
                                      title={state.label}
                                      sx={{ 
                                        border: currentState === key ? 2 : 1,
                                        borderColor: currentState === key ? `${state.color}.main` : 'grey.300',
                                        backgroundColor: currentState === key ? `${state.color}.50` : 'transparent',
                                        '&:hover': {
                                          backgroundColor: `${state.color}.50`,
                                        }
                                      }}
                                    >
                                      <StateIcon fontSize="small" />
                                    </IconButton>
                                  )
                                })}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </CardContent>
          </Card>
        </>
      )}

      {/* Mensaje cuando no hay estudiantes */}
      {listGenerated && students.length === 0 && (
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px dashed',
          borderColor: 'warning.light' 
        }}>
          <CardContent sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 6 
          }}>
            <Alert 
              severity="warning" 
              variant="outlined"
              sx={{ mb: 2, width: '100%', maxWidth: 500 }}
            >
              <AlertTitle>No se encontraron</AlertTitle>
              No hay estudiantes asignados a este tutor académico.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Verifica que el tutor tenga estudiantes asignados en el sistema.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  )

  const renderAttendanceHistory = () => (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Historial de listas de asistencia guardada.
        {selectedTutor && ` - Tutor: ${selectedTutor.nombre}`}
      </Typography>
      
      {!selectedTutor ? (
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px dashed',
          borderColor: 'info.light'
        }}>
          <CardContent>
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Alert 
                severity="info" 
                variant="outlined"
                sx={{ mb: 2, width: '100%', maxWidth: 500 }}
              >
                <AlertTitle>Selecciona un tutor</AlertTitle>
                Para ver el historial de asistencias, primero selecciona un tutor académico en la pestaña anterior.
              </Alert>
              
              <Button
                variant="contained"
                color="info"
                size="large"
                onClick={() => setTabValue(0)}
                sx={{ 
                  borderRadius: 2,
                  mt: 2,
                  px: 4,
                  fontWeight: 'medium',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                Ir a Registrar Asistencia
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : attendanceHistory.length === 0 ? (
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px dashed',
          borderColor: 'warning.light'
        }}>
          <CardContent>
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 4, 
                  backgroundColor: 'warning.50',
                  width: '100%',
                  maxWidth: 500
                }}
              >
                <HistoryIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'warning.main', 
                    mb: 2,
                    opacity: 0.8
                  }} 
                />
                <Typography variant="h6" fontWeight="medium" color="warning.dark" gutterBottom>
                  No hay registros de asistencia
                </Typography>
                <Typography variant="body1" color="warning.dark">
                  Este tutor aún no tiene listas de asistencia guardadas
                </Typography>
              </Paper>
              
              <Button
                variant="contained"
                color="warning"
                size="large"
                onClick={() => setTabValue(0)}
                sx={{ 
                  borderRadius: 2,
                  mt: 2,
                  px: 4,
                  fontWeight: 'medium',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                Registrar Primera Lista
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Historial de Asistencias - {selectedTutor.nombre}
            </Typography>
            
            <Paper sx={{ 
                width: '100%', 
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Estudiante</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Matrícula</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Carrera</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Observaciones</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Registrado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceHistory.map((record, idx) => {
                        const estado = mapEstadoToFrontend(record.estado)
                        const estadoInfo = attendanceStates[estado]
                        const StateIcon = estadoInfo?.icon || CheckCircleIcon
                        
                        return (
                          <TableRow 
                            key={`${record.id}-${idx}`}
                            sx={{
                              '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                              '&:hover': { backgroundColor: 'action.selected' }
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight="medium">
                                {format(new Date(record.fecha), 'dd/MM/yyyy')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.nombre}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="medium" variant="body2">
                                {record.matricula}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {record.carrera}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<StateIcon />}
                                label={estadoInfo?.label || record.estado}
                                color={estadoInfo?.color || 'default'}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {record.observaciones || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2">
                                  {format(new Date(record.created_at), 'dd/MM/yyyy')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(record.created_at), 'HH:mm')}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  )

  const handleCreateTestData = async () => {
    try {
      setLoading(true)
      const resultado = await crearDatosPrueba()
      
      if (resultado.success) {
        setSnackbar({
          open: true,
          message: 'Datos de prueba creados exitosamente',
          severity: 'success'
        })
        
        // Recargar tutores disponibles
        const tutores = await getTutoresDisponibles()
        setTutoresDisponibles(tutores)
        
        // Recargar la lista si hay un tutor seleccionado
        if (selectedTutor) {
          await generateList()
        }
      } else {
        setSnackbar({
          open: true,
          message: resultado.message || 'Error al crear datos de prueba',
          severity: 'error'
        })
      }
    } catch (error) {
      console.error('Error al crear datos de prueba:', error)
      setSnackbar({
        open: true,
        message: 'Error al crear datos de prueba',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Lista de Asistencia 
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestiona la asistencia de estudiantes asignados a tutores académicos.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Registrar Asistencia" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderAttendanceForm()}
      {tabValue === 1 && renderAttendanceHistory()}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          <AlertTitle>
            {snackbar.severity === 'success' && '¡Éxito!'}
            {snackbar.severity === 'error' && 'Error'}
            {snackbar.severity === 'warning' && 'Advertencia'}
            {snackbar.severity === 'info' && 'Información'}
          </AlertTitle>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
