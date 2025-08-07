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
  AlertTitle
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
import { format } from 'date-fns'

export default function ListasAsistencia() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [listType, setListType] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [listGenerated, setListGenerated] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  
  const attendanceStates = {
    present: { label: 'Asistencia', color: 'success', icon: CheckCircleIcon },
    late: { label: 'Retardo', color: 'warning', icon: AccessTimeIcon },
    absent: { label: 'Falta', color: 'error', icon: CancelIcon },
    excuse: { label: 'Permiso', color: 'info', icon: VerifiedUserIcon }
  }

 
  const groups = [
    { id: '1A', name: '1A' },
    { id: '1B', name: '1B' },
    { id: '2A', name: '2A' },
    { id: '2B', name: '2B' },
    { id: '3A', name: '3A' }
  ]

  const subjects = [
    { id: 'MAT', name: 'Matemáticas' },
    { id: 'FIS', name: 'Física' },
    { id: 'QUI', name: 'Química' },
    { id: 'BIO', name: 'Biología' },
    { id: 'ESP', name: 'Español' },
    { id: 'ING', name: 'Inglés' }
  ]

  const mockStudents = [
    { id: 1, nombre: 'Juan Pérez García', matricula: '202401', grupo: '1A' },
    { id: 2, nombre: 'María López Rodríguez', matricula: '202402', grupo: '1A' },
    { id: 3, nombre: 'Carlos Martínez Silva', matricula: '202403', grupo: '1A' },
    { id: 4, nombre: 'Ana García López', matricula: '202404', grupo: '1A' },
    { id: 5, nombre: 'Luis Rodríguez Pérez', matricula: '202005', grupo: '1A' },
    { id: 6, nombre: 'Carmen Hernández', matricula: '202406', grupo: '2A' },
    { id: 7, nombre: 'Pedro Sánchez', matricula: '202407', grupo: '2A' }
  ]

  const allTutorados = mockStudents
  const generateList = () => {
    let filteredStudents = []
    
    switch (listType) {
      case 'grupo':
        if (selectedGroup) {
          filteredStudents = mockStudents.filter(s => s.grupo === selectedGroup)
        }
        break
      case 'asignatura':
        if (selectedSubject) {
         
          filteredStudents = mockStudents 
        }
        break
      case 'tutorados':
        filteredStudents = allTutorados
        break
      default:
        filteredStudents = []
    }

    setStudents(filteredStudents)
    
   
    const initialAttendance = {}
    filteredStudents.forEach(student => {
      initialAttendance[student.id] = 'present'
    })
    setAttendance(initialAttendance)
    setListGenerated(true)
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSaveAttendance = () => {
    const attendanceRecord = {
      id: Date.now(),
      date: selectedDate,
      listType,
      group: selectedGroup,
      subject: selectedSubject,
      attendance,
      students: students.length,
      timestamp: new Date()
    }
    
    setAttendanceHistory(prev => [...prev, attendanceRecord])
    
 
    console.log('Guardando asistencia:', attendanceRecord)
    
    setSnackbar({
      open: true,
      message: '¡Lista de asistencia guardada correctamente!',
      severity: 'success'
    })
    
   
    resetForm()
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  }
  
  const resetForm = () => {
    setListType('')
    setSelectedGroup('')
    setSelectedSubject('')
    setStudents([])
    setAttendance({})
    setListGenerated(false)
  }

  const exportToCSV = () => {
    // Mejorar la estructura del archivo CSV con más información
    const typeLabel = listType === 'grupo' ? `Grupo ${selectedGroup}` :
                      listType === 'asignatura' ? subjects.find(s => s.id === selectedSubject)?.name :
                      'Tutorados';
    
    const dateFormatted = format(selectedDate, 'dd/MM/yyyy');
    const stats = getAttendanceStats();
    
    // Encabezados mejorados
    const headerInfo = [
      `# LISTA DE ASISTENCIA - ${dateFormatted}`,
      `# ${typeLabel}`,
      `# Generada: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
      `#`,
      `# Total estudiantes: ${stats.total}`,
      `# Asistencias: ${stats.present}`,
      `# Retardos: ${stats.late}`,
      `# Faltas: ${stats.absent}`,
      `# Permisos: ${stats.excuse}`,
      `#`,
      ''
    ];
    
    // Columnas del archivo
    const headers = ['Matrícula', 'Nombre', 'Grupo', 'Estado'];
    
    // Contenido completo del CSV
    const csvContent = [
      ...headerInfo,
      headers.join(','),
      ...students.map(student => [
        student.matricula,
        `"${student.nombre}"`,
        student.grupo,
        attendanceStates[attendance[student.id]]?.label || 'No definido'
      ].join(','))
    ].join('\n');

    // Generar el archivo para descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencia_${format(selectedDate, 'yyyy-MM-dd')}_${typeLabel.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar confirmación
    setSnackbar({
      open: true,
      message: 'Lista exportada correctamente en formato CSV',
      severity: 'info'
    });
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
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📋 Configurar Lista de Asistencia
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
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ mb: 1 }}>Tipo de Lista</FormLabel>
                <RadioGroup
                  value={listType}
                  onChange={(e) => {
                    setListType(e.target.value)
                    setListGenerated(false)
                    setStudents([])
                  }}
                  row
                >
                  <FormControlLabel 
                    value="grupo" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupIcon fontSize="small" />
                        Por Grupo
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="asignatura" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BookIcon fontSize="small" />
                        Por Asignatura
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="tutorados" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        Tutorados
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {listType === 'grupo' && (
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Seleccionar Grupo"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  fullWidth
                  required
                >
                  {groups.map(group => (
                    <MenuItem key={group.id} value={group.id}>
                      Grupo {group.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {listType === 'asignatura' && (
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Seleccionar Asignatura"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  fullWidth
                  required
                >
                  {subjects.map(subject => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={generateList}
                disabled={
                  !listType || 
                  (listType === 'grupo' && !selectedGroup) ||
                  (listType === 'asignatura' && !selectedSubject)
                }
                size="large"
                sx={{ borderRadius: 3 }}
              >
                Generar Lista de Asistencia
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

   
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
                <Typography variant="body2">Asistencias</Typography>
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
                <Typography variant="body2">Faltas</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                <Typography variant="h4" color="info.main">
                  {getAttendanceStats().excuse}
                </Typography>
                <Typography variant="body2">Permisos</Typography>
              </Paper>
            </Grid>
          </Grid>

       
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  📋 Lista de Asistencia - {format(selectedDate, 'dd/MM/yyyy')} - 
                  {listType === 'grupo' && ` Grupo ${selectedGroup}`}
                  {listType === 'asignatura' && ` ${subjects.find(s => s.id === selectedSubject)?.name}`}
                  {listType === 'tutorados' && ' Tutorados'}
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
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAttendance}
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
                    Guardar Asistencia
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
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: 'primary.50'
                          }}
                        >
                          Matrícula
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: 'primary.50'
                          }}
                        >
                          Nombre
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: 'primary.50'
                          }}
                        >
                          Grupo
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: 'primary.50'
                          }}
                        >
                          Estado
                        </TableCell>
                        <TableCell 
                          align="center" 
                          sx={{ 
                            fontWeight: 600, 
                            backgroundColor: 'primary.50'
                          }}
                        >
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
              <AlertTitle>No se encontraron estudiantes</AlertTitle>
              No hay estudiantes registrados para los criterios seleccionados.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Prueba seleccionando un grupo o asignatura diferente.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          <AlertTitle>{snackbar.severity === 'error' ? 'Error' : 'Éxito'}</AlertTitle>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
  const renderAttendanceHistory = () => (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Historial de todas las listas de asistencia generadas y guardadas.
      </Typography>
      
      {attendanceHistory.length === 0 ? (
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
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 4, 
                  backgroundColor: 'info.50',
                  width: '100%',
                  maxWidth: 500
                }}
              >
                <HistoryIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: 'info.main', 
                    mb: 2,
                    opacity: 0.8
                  }} 
                />
                <Typography variant="h6" fontWeight="medium" color="info.dark" gutterBottom>
                  No hay registros de asistencia
                </Typography>
                <Typography variant="body1" color="info.dark">
                  Las listas de asistencia que guardes aparecerán aquí
                </Typography>
              </Paper>
              
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
                Registrar Nueva Lista
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Historial de Asistencias
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
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Detalle</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Estudiantes</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Guardado</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'primary.50' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceHistory.map((record, idx) => (
                        <TableRow 
                          key={record.id}
                          sx={{
                            '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                            '&:hover': { backgroundColor: 'action.selected' }
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="medium">
                              {format(record.date, 'dd/MM/yyyy')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={
                                record.listType === 'grupo' ? 'Por Grupo' :
                                record.listType === 'asignatura' ? 'Por Asignatura' :
                                'Tutorados'
                              }
                              size="small"
                              color={
                                record.listType === 'grupo' ? 'primary' :
                                record.listType === 'asignatura' ? 'secondary' : 
                                'info'
                              }
                              variant="filled"
                              sx={{ fontWeight: 'medium' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {record.listType === 'grupo' && (
                                <>
                                  <GroupIcon fontSize="small" color="primary" />
                                  <Typography>Grupo {record.group}</Typography>
                                </>
                              )}
                              {record.listType === 'asignatura' && (
                                <>
                                  <BookIcon fontSize="small" color="secondary" />
                                  <Typography>{subjects.find(s => s.id === record.subject)?.name}</Typography>
                                </>
                              )}
                              {record.listType === 'tutorados' && (
                                <>
                                  <PersonIcon fontSize="small" color="info" />
                                  <Typography>Todos los tutorados</Typography>
                                </>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${record.students} estudiantes`} 
                              size="small" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2">
                                {format(record.timestamp, 'dd/MM/yyyy')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(record.timestamp, 'HH:mm')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<GetAppIcon />}
                              onClick={() => {
                                // Mejorar contenido del CSV exportado
                                const typeLabel = record.listType === 'grupo' ? `Grupo ${record.group}` :
                                                record.listType === 'asignatura' ? subjects.find(s => s.id === record.subject)?.name :
                                                'Tutorados';
                                
                                // Encabezados mejorados
                                const headerInfo = [
                                  `# LISTA DE ASISTENCIA - ${format(record.date, 'dd/MM/yyyy')}`,
                                  `# ${typeLabel}`,
                                  `# Generada: ${format(record.timestamp, 'dd/MM/yyyy HH:mm:ss')}`,
                                  `# Total estudiantes: ${record.students}`,
                                  `#`,
                                  ''
                                ];
                                
                                const csvContent = [
                                  ...headerInfo,
                                  ['Matrícula', 'Nombre', 'Grupo', 'Estado'].join(','),
                                  '# Este es un registro histórico'
                                ].join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                const url = URL.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute('download', `asistencia_${format(record.date, 'yyyy-MM-dd')}_${typeLabel.replace(/\s+/g, '_')}.csv`);
                                link.style.visibility = 'hidden';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                
                                // Mostrar confirmación
                                setSnackbar({
                                  open: true,
                                  message: 'Registro histórico exportado correctamente',
                                  severity: 'info'
                                });
                              }}
                              sx={{ 
                                borderRadius: 2,
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                              }}
                            >
                              Exportar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  )

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Listas de Asistencia
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestiona y registra la asistencia de tus estudiantes por grupo y materia.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Registrar Asistencia" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderAttendanceForm()}
      {tabValue === 1 && renderAttendanceHistory()}
      
      {/* Alerta de notificación mejorada */}
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
