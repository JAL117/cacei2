import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import {
  getAlumnosByTutor,
  getMateriasByTutor,
  createIncidencia,
  getIncidenciasByTutor,
  TIPOS_INTERVENCION,
  validarDatosIncidencia
} from '../../../api/incidencias'

export default function Intervenciones() {
  // Estados para datos del backend
  const [alumnos, setAlumnos] = useState([])
  const [materias, setMaterias] = useState([])
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Obtener ID del tutor desde localStorage
  const tutorId = localStorage.getItem('userID')
  
  // Estados existentes
  const [openDialog, setOpenDialog] = useState(false)
  const [form, setForm] = useState({
    estudiante: null,
    materia: null,
    tipo: '',
    descripcion: ''
  })
  const [search, setSearch] = useState('')

  // Cargar datos iniciales
  useEffect(() => {
    if (tutorId) {
      loadInitialData()
    } else {
      setError('No se encontró el ID del tutor en el sistema')
      setLoading(false)
    }
  }, [tutorId])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando datos para tutor:', tutorId)
      
      // Cargar alumnos, materias e incidencias en paralelo
      const [alumnosData, materiasData, incidenciasData] = await Promise.all([
        getAlumnosByTutor(tutorId),
        getMateriasByTutor(tutorId),
        getIncidenciasByTutor(tutorId).catch(() => []) // Si falla, usar array vacío
      ])
      
      console.log('✅ Datos cargados:', { 
        alumnos: alumnosData.length, 
        materias: materiasData.length,
        incidencias: incidenciasData.length 
      })
      
      setAlumnos(alumnosData)
      setMaterias(materiasData)
      setInterventions(incidenciasData)
      
    } catch (err) {
      console.error('💥 Error cargando datos iniciales:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = () => setOpenDialog(true)
  
  const handleCloseDialog = () => {
    setOpenDialog(false)
    setForm({ estudiante: null, materia: null, tipo: '', descripcion: '' })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      
      // Preparar datos para validación
      const incidenciaData = {
        matricula_estudiante: form.estudiante?.matricula,
        materia_id: form.materia?.id,
        tutor_id: tutorId,
        tipoDeIntervencion: form.tipo,
        descripcion: form.descripcion.trim()
      }
      
      // Validar datos
      const validacion = validarDatosIncidencia(incidenciaData)
      if (!validacion.esValido) {
        setError(validacion.errores.join('\n'))
        return
      }
      
      console.log('💾 Guardando incidencia:', incidenciaData)
      
      // Crear incidencia en el backend
      const result = await createIncidencia(incidenciaData)
      
      // Agregar al estado local con información completa para mostrar
      const nuevaIncidencia = {
        id: result.data?.id || Date.now(),
        estudiante: form.estudiante,
        materia: form.materia?.nombre,
        tipo: form.tipo,
        descripcion: form.descripcion,
        fecha: new Date().toLocaleDateString('es-ES')
      }
      
      setInterventions(prev => [nuevaIncidencia, ...prev])
      handleCloseDialog()
      
      console.log('✅ Incidencia creada exitosamente')
      
    } catch (err) {
      console.error('💥 Error guardando incidencia:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Filtrar intervenciones por búsqueda
  const filteredInterventions = interventions.filter(i =>
    (i.estudiante?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
     i.estudiante?.matricula?.toLowerCase().includes(search.toLowerCase()) ||
     i.materia?.toLowerCase().includes(search.toLowerCase()) ||
     TIPOS_INTERVENCION.find(t => t.value === i.tipo)?.label.toLowerCase().includes(search.toLowerCase()) ||
     i.descripcion?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Registro de Intervenciones
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Nueva Intervención
        </Button>
      </Box>

      <TextField
        label="Buscar intervención"
        variant="outlined"
        size="small"
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        placeholder="Buscar por nombre, matrícula, materia, tipo o descripción..."
      />

      {/* Lista de intervenciones filtradas */}
      <Grid container spacing={3}>
        {filteredInterventions.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              No se encontraron intervenciones.
            </Typography>
          </Grid>
        ) : (
          filteredInterventions.map((i) => (
            <Grid item xs={12} key={i.id}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">{i.estudiante.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">{i.estudiante.matricula} • {i.materia}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <b>Tipo:</b> {TIPOS_INTERVENCION.find(t => t.value === i.tipo)?.label}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <b>Descripción:</b> {i.descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {i.fecha}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialogo para nueva intervención */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ pb: 0 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ textAlign: 'center' }}>Registrar Intervención</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            <Box sx={{ maxWidth: 500, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
              <Autocomplete
                options={alumnos}
                getOptionLabel={(option) => `${option.nombre} (${option.matricula})`}
                value={form.estudiante}
                onChange={(_, value) => setForm({ ...form, estudiante: value })}
                filterOptions={(options, { inputValue }) =>
                  options.filter(
                    o =>
                      o.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
                      o.matricula.toLowerCase().includes(inputValue.toLowerCase())
                  )
                }
                renderInput={(params) => (
                  <TextField {...params} label="Buscar alumno por nombre o matrícula" required variant="outlined" fullWidth sx={{ mb: 2, borderRadius: 2, background: '#fff' }} />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ p: 1.5 }}>
                    <Typography variant="body1" fontWeight="bold">{option.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">Matrícula: {option.matricula}</Typography>
                  </Box>
                )}
                disabled={loading}
                loading={loading}
              />
              <Autocomplete
                options={materias}
                getOptionLabel={option => option.nombre || ''}
                value={form.materia}
                onChange={(_, value) => setForm({ ...form, materia: value })}
                filterOptions={(options, { inputValue }) =>
                  options.filter(m => m.nombre?.toLowerCase().includes(inputValue.toLowerCase()))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Buscar materia" required variant="outlined" fullWidth sx={{ mb: 2, borderRadius: 2, background: '#fff' }} />
                )}
                disabled={loading}
                loading={loading}
              />
              <TextField
                select
                label="Tipo de Intervención"
                value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}
                required
                fullWidth
                variant="outlined"
                sx={{ mb: 2, borderRadius: 2, background: '#fff' }}
              >
                {TIPOS_INTERVENCION.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Descripción"
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                required
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                sx={{ borderRadius: 2, background: '#fff' }}
                placeholder="Describe la intervención realizada..."
              />
              
              {saving && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Guardando incidencia...</Typography>
                </Box>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'center' }}>
            <Button onClick={handleCloseDialog} variant="outlined" sx={{ borderRadius: 2, px: 4 }} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ borderRadius: 2, px: 4 }}
              disabled={saving || !form.estudiante || !form.materia || !form.tipo || !form.descripcion.trim()}
            >
              Registrar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}