import { useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Avatar,
  Chip,
  Button,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material'
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Book as BookIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDocenteDashboard } from '../../../hooks/useDocenteDashboard.js'
import Sidebar from '../../../components/Sidebar'
import ListaAsistencia from './ListaAsistencia'
import RegistrarUnidades from './RegistrarUnidades'
import Calificaciones from './Calificaciones'
import DisenoInstruccional from './DisenoInstruccional'
import ReportarIncidencia from './ReportarIncidencia'

const sidebarItems = [
  { label: 'Panel', icon: 'dashboard', path: '/docente/home' },
  { label: 'Lista de Asistencia', icon: 'assignment', path: '/docente/lista-asistencia' },
  { label: 'Registrar Unidades', icon: 'book', path: '/docente/registrar-unidades' },
  { label: 'Calificaciones', icon: 'school', path: '/docente/calificaciones' },
  { label: 'Intervenciones', icon: 'report', path: '/docente/reportar-incidencia' },
  { label: 'Diseño Instruccional', icon: 'people', path: '/docente/diseno-instruccional' },
]

export default function DocenteHome() {
  const [currentView, setCurrentView] = useState('Panel')
  const navigate = useNavigate()
  
  // Hook para obtener datos del dashboard
  const { 
    materias, 
    alumnos, 
    intervenciones, 
    stats, 
    loading, 
    error, 
    reloadData 
  } = useDocenteDashboard()

  const handleNavigation = (label) => {
    setCurrentView(label)
  }

  const handleLogout = () => {
    localStorage.removeItem('userType')
    localStorage.removeItem('userData')
    localStorage.removeItem('userID')
    navigate('/login', { replace: true })
  }

  const itemsWithHandlers = sidebarItems.map(item => ({
    ...item,
    onClick: () => navigate(item.path)
  }))

  // Usar estadísticas reales
  const statsData = [
    { 
      title: 'Materias Asignadas', 
      value: stats.totalMaterias.toString(), 
      icon: BookIcon, 
      color: 'primary', 
      trend: loading ? '...' : '+0' 
    },
    { 
      title: 'Estudiantes', 
      value: stats.totalAlumnos.toString(), 
      icon: SchoolIcon, 
      color: 'success', 
      trend: loading ? '...' : '+0' 
    },
    { 
      title: 'Intervenciones', 
      value: stats.totalIntervenciones.toString(), 
      icon: WarningIcon, 
      color: 'warning', 
      trend: loading ? '...' : '+0' 
    },
    { 
      title: 'Promedio General', 
      value: stats.promedioGeneral.toString(), 
      icon: TrendingUpIcon, 
      color: 'info', 
      trend: loading ? '...' : '+0.2' 
    },
  ]

  const renderDashboard = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Panel de Control - Docente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido de vuelta. Aquí tienes un resumen de tus actividades docentes.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={reloadData}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </Box>

      {/* Mostrar error si existe */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error al cargar datos</AlertTitle>
          {error}
        </Alert>
      )}
      
      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight={500}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      {loading ? <CircularProgress size={24} /> : stat.value}
                    </Typography>
                    <Chip 
                      label={stat.trend} 
                      size="small" 
                      color={stat.trend.includes('+') ? 'success' : 'default'}
                      sx={{ mt: 1, fontSize: '0.75rem' }}
                    />
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: `${stat.color}.main`, 
                    width: 48, 
                    height: 48,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                  }}>
                    <stat.icon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Lista de Materias */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: 400,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BookIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Mis Materias
                  </Typography>
                  <Chip 
                    label={`${materias.length} asignaturas`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : materias.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron materias asignadas
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {materias.slice(0, 8).map((materia, index) => (
                      <Paper key={materia.id || index} sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        backgroundColor: '#f8f9fa',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#e9ecef',
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main', 
                            width: 32, 
                            height: 32 
                          }}>
                            <BookIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {materia.nombre || materia.materia || 'Materia sin nombre'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {materia.codigo && `Código: ${materia.codigo}`}
                              {materia.creditos && ` • ${materia.creditos} créditos`}
                              {materia.grupos && ` • ${materia.grupos.length} grupos`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                    {materias.length > 8 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        Y {materias.length - 8} materias más...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de Estudiantes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: 400,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="success" />
                  <Typography variant="h6" fontWeight="bold">
                    Estudiantes
                  </Typography>
                  <Chip 
                    label={`${alumnos.length} registrados`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : alumnos.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron estudiantes registrados
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {alumnos.slice(0, 8).map((alumno, index) => (
                      <Paper key={alumno.id || index} sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        backgroundColor: '#f0f8f0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#e8f5e8',
                          transform: 'translateX(4px)'
                        }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: 'success.main', 
                            width: 32, 
                            height: 32 
                          }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {alumno.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Mat: {alumno.matricula}
                              {alumno.grupo && ` • Grupo: ${alumno.grupo}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                    {alumnos.length > 8 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        Y {alumnos.length - 8} estudiantes más...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Intervenciones Recientes */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: 300,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    Intervenciones Recientes
                  </Typography>
                  <Chip 
                    label={`${intervenciones.length} registradas`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="warning"
                  onClick={() => handleNavigation('Intervenciones')}
                  endIcon={<ArrowForwardIcon />}
                >
                  Gestionar todas
                </Button>
              </Box>
              
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : intervenciones.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay intervenciones registradas
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {intervenciones.slice(0, 4).map((intervencion, index) => (
                      <Grid item xs={12} md={6} key={intervencion.id || index}>
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          backgroundColor: '#fff8e1',
                          border: '1px solid #ffcc02',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: '#fff3c4',
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: 'warning.main', 
                              width: 32, 
                              height: 32 
                            }}>
                              <WarningIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {intervencion.estudiante?.nombre || 'Estudiante desconocido'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {intervencion.tipo} • {intervencion.fecha}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )

  const renderView = () => {
    switch (currentView) {
      case 'Panel':
        return renderDashboard()
      case 'Lista de Asistencia':
        return <ListaAsistencia />
      case 'Registrar Unidades':
        return <RegistrarUnidades />
      case 'Calificaciones':
        return <Calificaciones />
      case 'Intervenciones':
        return <ReportarIncidencia />
      case 'Diseño Instruccional':
        return <DisenoInstruccional />
      default:
        return renderDashboard()
    }
  }

  return (
    <Sidebar 
      items={itemsWithHandlers} 
      userName="Docente" 
      userRole="Docente"
      onLogout={handleLogout}
    >
      {renderView()}
    </Sidebar>
  )
}
