import { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Grid, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { getMaterias, getMateriasWithRelaciones, getDocentesActivos, createMateria } from '../../../api/materias'

export default function Materias() {
  // Estados principales
  const [materias, setMaterias] = useState([])
  const [docentes, setDocentes] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    cuatrimestre: '',
    grupos: [{ numero: 1, profesor: '' }]
  })
  
  // Estados para UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  
  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Cargar materias con relaciones completas y docentes en paralelo
      const [materiasData, docentesData] = await Promise.all([
        getMateriasWithRelaciones(),
        getDocentesActivos()
      ])
      
      console.log('🔍 Frontend: Materias con relaciones cargadas:', materiasData)
      console.log('🔍 Frontend: Docentes cargados:', docentesData)
      
      setMaterias(materiasData)
      setDocentes(docentesData)
      
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos. Por favor, intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGrupo = () => {
    setFormData({
      ...formData,
      grupos: [...formData.grupos, { numero: formData.grupos.length + 1, profesor: '' }]
    })
  }

  const handleGrupoChange = (index, field, value) => {
    const newGrupos = [...formData.grupos]
    newGrupos[index] = { ...newGrupos[index], [field]: value }
    setFormData({ ...formData, grupos: newGrupos })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Mostrar datos que se enviarán a la API
      console.log('📤 Enviando datos a la API:', {
        nombre: formData.nombre,
        num_cuatri: formData.cuatrimestre,
        gruposCount: formData.grupos.length,
        grupos: formData.grupos.map(g => ({
          numero: g.numero,
          profesor: typeof g.profesor === 'object' ? {
            id: g.profesor.id,
            nombre: g.profesor.nombre
          } : g.profesor
        }))
      })
      
      // Crear nueva materia
      const nuevaMateria = await createMateria(formData)
      
      // Transformar la respuesta para que coincida con el formato esperado por la UI
      const materiaParaUI = {
        id: nuevaMateria.asignatura?.data?.id || Date.now(),
        nombre: formData.nombre,
        cuatrimestre: formData.cuatrimestre,
        grupos: formData.grupos || []
      }
      
      // Actualizar estado local
      setMaterias(prevMaterias => [...prevMaterias, materiaParaUI])
      
      // Limpiar formulario y cerrar diálogo
      setFormData({
        nombre: '',
        cuatrimestre: '',
        grupos: [{ numero: 1, profesor: '' }]
      })
      setOpenDialog(false)
      
      // Mostrar mensaje de éxito
      setSnackbar({
        open: true,
        message: 'Materia creada exitosamente',
        severity: 'success'
      })
      
    } catch (error) {
      console.error('Error al crear materia:', error)
      setSnackbar({
        open: true,
        message: 'Error al crear la materia. Por favor, intente de nuevo.',
        severity: 'error'
      })
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
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadData}>
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Asignar Materias
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configura grupos y asigna profesores a las materias ({materias.length} materias, {docentes.length} docentes activos)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 3 }}
          disabled={docentes.length === 0}
        >
          Nueva Materia
        </Button>
      </Box>

     
      <Grid container spacing={3}>
        {materias.map((materia) => (
          <Grid item xs={12} md={6} key={materia.id}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {materia.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {materia.cuatrimestre && `Cuatrimestre ${materia.cuatrimestre} • `}{materia.grupos && Array.isArray(materia.grupos) ? materia.grupos.length : 0} grupo(s) configurado(s)
                </Typography>
                
                <List dense>
                  {materia.grupos && Array.isArray(materia.grupos) && materia.grupos.map((grupo) => (
                    <ListItem key={`${materia.id}-${grupo.numero}`} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={`Grupo ${grupo.numero}`} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="body2">
                              {grupo.profesor && typeof grupo.profesor === 'object' 
                                ? `${grupo.profesor.nombre || 'Sin nombre'} ${grupo.profesor.apellido || ''}`
                                : grupo.profesor_id || 'Sin asignar'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          grupo.profesor && typeof grupo.profesor === 'object' && grupo.profesor.email && (
                            <Typography variant="caption" color="text.secondary">
                              {grupo.profesor.email}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                  {(!materia.grupos || materia.grupos.length === 0) && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No hay grupos configurados
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Snackbar para notificaciones */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Configurar Nueva Materia</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nombre de la materia"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                fullWidth
              />
              
              <TextField
                select
                label="Cuatrimestre"
                value={formData.cuatrimestre}
                onChange={(e) => setFormData({ ...formData, cuatrimestre: e.target.value })}
                required
                fullWidth
                helperText="Selecciona el cuatrimestre al que pertenece la materia"
              >
                <MenuItem value={1}>1er Cuatrimestre</MenuItem>
                <MenuItem value={2}>2do Cuatrimestre</MenuItem>
                <MenuItem value={3}>3er Cuatrimestre</MenuItem>
                <MenuItem value={4}>4to Cuatrimestre</MenuItem>
                <MenuItem value={5}>5to Cuatrimestre</MenuItem>
                <MenuItem value={6}>6to Cuatrimestre</MenuItem>
                <MenuItem value={7}>7mo Cuatrimestre</MenuItem>
                <MenuItem value={8}>8vo Cuatrimestre</MenuItem>
                <MenuItem value={9}>9no Cuatrimestre</MenuItem>
                <MenuItem value={10}>10mo Cuatrimestre</MenuItem>
              </TextField>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Grupos
              </Typography>
              
              {formData.grupos.map((grupo, index) => (
                <Card key={index} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Grupo {grupo.numero}
                  </Typography>
                  <TextField
                    select
                    label="Profesor"
                    value={grupo.profesor ? (typeof grupo.profesor === 'object' ? grupo.profesor.id : grupo.profesor) : ''}
                    onChange={(e) => {
                      const selectedDocente = docentes.find(d => d.id === e.target.value)
                      handleGrupoChange(index, 'profesor', selectedDocente)
                    }}
                    required
                    fullWidth
                    size="small"
                    helperText={docentes.length === 0 ? "No hay docentes activos disponibles" : ""}
                    error={docentes.length === 0}
                  >
                    {docentes.map((docente) => (
                      <MenuItem key={docente.id} value={docente.id}>
                        {docente.nombre} {docente.apellido || ''} - {docente.email}
                      </MenuItem>
                    ))}
                  </TextField>
                </Card>
              ))}
              
              <Button
                variant="outlined"
                onClick={handleAddGrupo}
                sx={{ alignSelf: 'flex-start' }}
              >
                Agregar Grupo
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Guardar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
