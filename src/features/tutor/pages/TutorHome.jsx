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
  IconButton,
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
  NotificationsActive as NotificationsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTutorDashboard } from '../../../hooks/useTutorDashboard.js'
import Sidebar from '../../../components/Sidebar'
import ListasAsistencia from './ListasAsistencia'
import RegistrarUnidades from './RegistrarUnidades'
import Calificaciones from './Calificaciones'
import TrayectoriaEscolar from './TrayectoriaEscolar'
import Incidencias from './Incidencias'
import TutoriasGrupales from './TutoriasGrupales'

const sidebarItems = [
  { label: 'Panel', icon: 'dashboard', path: '/tutor/home' },
  { label: 'Listas de Asistencia', icon: 'assignment', path: '/tutor/listas-asistencia' },
  { label: 'Registrar Unidades', icon: 'book', path: '/tutor/registrar-unidades' },
  { label: 'Calificaciones', icon: 'grade', path: '/tutor/calificaciones' },
  { label: 'Trayectoria Escolar', icon: 'timeline', path: '/tutor/trayectoria-escolar' },
  { label: 'Intervenciones', icon: 'warning', path: '/tutor/incidencias' },
  { label: 'Tutorías', icon: 'group', path: '/tutor/tutorias-grupales' },
]

export default function TutorHome() {
  const [currentView, setCurrentView] = useState('Panel')
  const navigate = useNavigate()
  
  // Hook para obtener datos del dashboard
  const { 
    tutorados, 
    asignaturas, 
    intervenciones, 
    stats, 
    loading, 
    error, 
    reloadData 
  } = useTutorDashboard()

  const handleNavigation = (label) => {
    setCurrentView(label)
  }



  const itemsWithHandlers = sidebarItems.map(item => ({
    ...item,
    onClick: () => navigate(item.path)
  }))

  // Usar datos reales de intervenciones
  const alertas = intervenciones.filter(intervencion => 
    intervencion.estado === 'PENDIENTE'
  ).map(intervencion => ({
    id: intervencion.id,
    estudiante: intervencion.estudiante?.nombre || 'Estudiante desconocido',
    matricula: intervencion.estudiante?.matricula || 'Sin matrícula',
    tipo: intervencion.tipo || 'Académica',
    prioridad: 'Alta', // Podría determinarse por el tipo de intervención
    descripcion: intervencion.descripcion || 'Sin descripción',
    fecha: intervencion.fecha,
    estado: intervencion.estado
  }))

  // Usar estadísticas reales
  const statsData = [
    { 
      title: 'Tutorados', 
      value: stats.totalTutorados.toString(), 
      icon: SchoolIcon, 
      color: 'primary', 
      trend: loading ? '...' : '+0' 
    },
    { 
      title: 'Asignaturas Asignadas', 
      value: stats.totalAsignaturas.toString(), 
      icon: AssignmentIcon, 
      color: 'success', 
      trend: loading ? '...' : '+0' 
    },
    { 
      title: 'Alertas Activas', 
      value: stats.alertasActivas.toString(), 
      icon: WarningIcon, 
      color: 'error', 
      trend: loading ? '...' : '-0' 
    },
  ]



  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'error'
      case 'Media': return 'warning'
      case 'Baja': return 'info'
      default: return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Académica': return 'primary'
      case 'Asistencia': return 'warning'
      case 'Conductual': return 'error'
      case 'Personal': return 'info'
      default: return 'default'
    }
  }
  const renderDashboard = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Panel de Control - Tutor Académico
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido de vuelta. Aquí tienes un resumen de tus actividades académicas.
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
        {/* Lista de Tutorados */}
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
                  <SchoolIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Mis Tutorados
                  </Typography>
                  <Chip 
                    label={`${tutorados.length} estudiantes`}
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
                ) : tutorados.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron tutorados asignados
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {tutorados.slice(0, 8).map((tutorado, index) => (
                      <Paper key={tutorado.id || index} sx={{ 
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
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {tutorado.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Mat: {tutorado.matricula}
                              {tutorado.grupo && ` • Grupo: ${tutorado.grupo}`}
                              {tutorado.cuatrimestre && ` • ${tutorado.cuatrimestre}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                    {tutorados.length > 8 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        Y {tutorados.length - 8} tutorados más...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Asignaturas */}
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
                  <AssignmentIcon color="success" />
                  <Typography variant="h6" fontWeight="bold">
                    Mis Asignaturas
                  </Typography>
                  <Chip 
                    label={`${asignaturas.length} materias`}
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
                ) : asignaturas.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron asignaturas asignadas
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {asignaturas.slice(0, 8).map((asignatura, index) => (
                      <Paper key={asignatura.id || index} sx={{ 
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
                            <AssignmentIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {asignatura.nombre || asignatura.materia || 'Materia sin nombre'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {asignatura.codigo && `Código: ${asignatura.codigo}`}
                              {asignatura.creditos && ` • ${asignatura.creditos} créditos`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                    {asignaturas.length > 8 && (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                        Y {asignaturas.length - 8} asignaturas más...
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Alertas e Incidencias */}
        <Grid item xs={12}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            height: 'calc(100vh - 400px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon color="error" />
                  <Typography variant="h6" fontWeight="bold">
                    Lista de intervenciones
                  </Typography>
                  <Chip 
                    label={`${alertas.length} activas`}
                    size="small"
                    color={alertas.length > 0 ? "error" : "default"}
                    variant="outlined"
                  />
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="error"
                  onClick={() => handleNavigation('Incidencias')}
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
                ) : alertas.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No hay alertas activas en este momento
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {alertas.map((alerta) => (
                      <Grid item xs={12} md={6} key={alerta.id}>
                        <Paper sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          border: `2px solid ${getPriorityColor(alerta.prioridad) === 'error' ? '#f44336' : 
                            getPriorityColor(alerta.prioridad) === 'warning' ? '#ff9800' : '#2196f3'}`,
                          backgroundColor: `${getPriorityColor(alerta.prioridad) === 'error' ? '#ffebee' : 
                            getPriorityColor(alerta.prioridad) === 'warning' ? '#fff3e0' : '#e3f2fd'}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: `${getPriorityColor(alerta.prioridad)}.main`, 
                              width: 40, 
                              height: 40 
                            }}>
                              <PersonIcon />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {alerta.estudiante}
                                </Typography>
                                <Chip 
                                  label={alerta.prioridad} 
                                  size="small" 
                                  color={getPriorityColor(alerta.prioridad)}
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Mat: {alerta.matricula} • {alerta.tipo}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {alerta.descripcion}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  {alerta.fecha}
                                </Typography>
                                <Chip 
                                  label={alerta.estado} 
                                  size="small" 
                                  variant="outlined"
                                  color={alerta.estado === 'PENDIENTE' ? 'warning' : 'info'}
                                />
                              </Box>
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
      case 'Listas de Asistencia':
        return <ListasAsistencia />
      case 'Registrar Unidades':
        return <RegistrarUnidades />
      case 'Calificaciones':
        return <Calificaciones />
      case 'Trayectoria Escolar':
        return <TrayectoriaEscolar />
      case 'Incidencias':
        return <Incidencias />
      case 'Tutorías':
        return <TutoriasGrupales />
      default:
        return renderDashboard()
    }
  }
  return (
     <>
     {renderView()}
     </>
      
  )
}
