import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Button, Chip, LinearProgress, Avatar, Divider, CircularProgress } from '@mui/material'
import StatsCard from '../components/StatsCard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import WarningIcon from '@mui/icons-material/Warning'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AssignmentIcon from '@mui/icons-material/Assignment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getDashboardStats } from '../../../api/dashboard.js'

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Dashboard: Cargando datos...')
      
      const data = await getDashboardStats()
      setDashboardData(data)
      console.log('✅ Dashboard: Datos cargados exitosamente:', data.summary)
      
    } catch (err) {
      console.error('💥 Dashboard: Error al cargar datos:', err)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Generar estadísticas dinámicas basadas en datos reales
  const getStats = () => {
    if (!dashboardData) {
      return [
        { 
          title: 'Total de Alumnos', 
          value: '0', 
          icon: SchoolIcon, 
          change: '0%', 
          color: '#3B82F6',
          description: 'Estudiantes únicos' 
        },
        { 
          title: 'Personal Activo', 
          value: '0', 
          icon: PeopleIcon, 
          change: '0%', 
          color: '#10B981',
          description: 'Docentes y tutores' 
        },
      ]
    }

    const { summary, alumnos, personal } = dashboardData

    // Formatear números con comas
    const formatNumber = (num) => {
      return num.toLocaleString('es-MX')
    }

    return [
      { 
        title: 'Total de Alumnos', 
        value: formatNumber(summary.totalAlumnos), 
        icon: SchoolIcon, 
        change: '+5.2%', // Placeholder - se puede calcular con datos históricos
        color: '#3B82F6',
        description: `${formatNumber(alumnos.totalRegistros)} registros totales` 
      },
      { 
        title: 'Personal Activo', 
        value: formatNumber(summary.personalActivo), 
        icon: PeopleIcon, 
        change: personal.total > 0 ? `${Math.round((personal.activos / personal.total) * 100)}% del total` : '0%',
        color: '#10B981',
        description: `${formatNumber(personal.total)} total registrado` 
      },
      { 
        title: 'Materias Activas', 
        value: formatNumber(summary.materiasActivas), // Placeholder hasta implementar materias API
        icon: MenuBookIcon, 
        change: '+8.3%', // Placeholder
        color: '#8B5CF6',
        description: 'Módulos en curso' 
      },
      { 
        title: 'Alertas de Riesgo', 
        value: formatNumber(summary.alertasRiesgo), // Placeholder hasta implementar alertas API
        icon: WarningIcon, 
        change: '-12.5%', // Placeholder
        color: '#EF4444', 
        isNegative: true,
        description: 'Requieren atención' 
      },
    ]
  }
  // Mostrar loading spinner mientras cargan los datos
  if (loading) {
    return (
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3
      }}>
        <CircularProgress size={60} sx={{ color: '#3B82F6' }} />
        <Typography variant="h6" color="text.secondary">
          Cargando datos del dashboard...
        </Typography>
      </Box>
    )
  }

  // Mostrar error si hay problemas
  if (error) {
    return (
      <Box sx={{ 
        width: '100%', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        p: 3
      }}>
        <WarningIcon sx={{ fontSize: 60, color: '#EF4444' }} />
        <Typography variant="h6" color="error" textAlign="center">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={loadDashboardData}
          sx={{ bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
        >
          Reintentar
        </Button>
      </Box>
    )
  }

  const stats = getStats()

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, sm: 3, md: 4 },
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
   
      <Box sx={{ mb: { xs: 1, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', lg: 'flex-start' }, 
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, lg: 0 }
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h3" 
              fontWeight="700" 
              sx={{ 
                color: '#1F2937', 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}
            >
              Dashboard Director
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 400,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              Resumen general del sistema KairoLink {dashboardData && (
                <Chip 
                  label={`Actualizado: ${new Date(dashboardData.timestamp).toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}`}
                  size="small"
                  sx={{ 
                    ml: 1, 
                    bgcolor: '#E5F3FF', 
                    color: '#3B82F6',
                    fontSize: '0.75rem'
                  }}
                />
              )}
            </Typography>
          </Box>
          <Box sx={{ 
            textAlign: { xs: 'left', lg: 'right' },
            minWidth: { xs: 'auto', lg: 'fit-content' }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 1,
              flexWrap: 'wrap'
            }}>
              <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Martes, 8 de Julio 2025
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexWrap: 'wrap'
            }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                15:42 PM
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

   
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ 
        width: '100%',
        margin: 0,
        '& .MuiGrid-item': {
          paddingLeft: { xs: '8px', sm: '12px' },
          paddingTop: { xs: '8px', sm: '12px' }
        }
      }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index} sx={{ 
            paddingLeft: { xs: '8px !important', sm: '12px !important' },
            paddingTop: { xs: '8px !important', sm: '12px !important' }
          }}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
