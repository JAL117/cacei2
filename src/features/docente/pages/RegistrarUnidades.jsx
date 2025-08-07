import React, { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Grid,
  Divider
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, MenuBook as BookIcon } from '@mui/icons-material'
import { 
  validateActivityWeight, 
  validateActivitiesWeightSum, 
  validateAcademicUnit,
  validateDateRange,
  sanitizePercentage 
} from '../../../utils/validations'

export default function RegistrarUnidades() {
  const subjects = useMemo(() => [
    { id: 'all', name: 'Todas las asignaturas' },
    { id: 'calc', name: 'Cálculo Diferencial' },
    { id: 'poo', name: 'Programación Orientada a Objetos' },
    { id: 'db', name: 'Base de Datos' },
    { id: 'net', name: 'Redes de Computadoras' }
  ], [])

  const [filterSubj, setFilterSubj] = useState('poo')
  const [units, setUnits] = useState([
    {
      id: 1,
      subject: 'poo',
      name: 'Unidad 1 - Fundamentos de POO',
      description: 'Introducción a los conceptos básicos de programación orientada a objetos',
      startDate: '2025-07-01',
      endDate: '2025-07-31',
      activities: [
        { name: 'Examen Parcial', description: 'Evaluación teórica', weight: '40' },
        { name: 'Proyecto Final', description: 'Desarrollo de aplicación', weight: '60' }
      ]
    },
    {
      id: 2,
      subject: 'calc',
      name: 'Unidad 1 - Límites',
      description: 'Conceptos fundamentales de límites y continuidad',
      startDate: '2025-07-01',
      endDate: '2025-08-15',
      activities: [
        { name: 'Examen', description: 'Evaluación práctica', weight: '70' },
        { name: 'Tareas', description: 'Ejercicios semanales', weight: '30' }
      ]
    }
  ])
  const [editing, setEditing] = useState(false) // Start with form closed since we have units
  const [form, setForm] = useState({
    subject: 'poo',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    activities: [{ name: 'Examen Parcial', description: 'Descripción breve', weight: '' }]
  })

  // Auto-open form when no units exist
  useEffect(() => {
    if (units.length === 0 && !editing) {
      setEditing(true)
    }
  }, [units.length, editing])

  const totalWeight = useMemo(
    () => form.activities.reduce((sum, a) => sum + Number(a.weight || 0), 0),
    [form.activities]
  )

  const handleFilter = (e) => {
    const newFilter = e.target.value
    setFilterSubj(newFilter)
    // Close editing form when changing filter unless it's "all"
    if (editing && newFilter !== 'all') {
      setEditing(false)
    }
  }
  const openForm = () => {
    setForm({ 
      subject: filterSubj === 'all' ? 'poo' : filterSubj, 
      name: '', 
      description: '',
      startDate: '',
      endDate: '',
      activities: [{ name: 'Examen Parcial', description: 'Descripción breve', weight: '' }] 
    })
    setEditing(true)
  }
  const closeForm = () => setEditing(false)

  const addActivity = () => setForm(f => ({ ...f, activities: [...f.activities, { name: '', description: '', weight: '' }] }))
  const removeActivity = idx => setForm(f => ({ ...f, activities: f.activities.filter((_, i) => i !== idx) }))
  const changeActivity = (idx, field, val) => {
    // Si se está cambiando el peso, validar
    if (field === 'weight') {
      const validationError = validateActivityWeight(val);
      if (validationError && val.trim() !== '') {
        console.warn(`Validación de peso: ${validationError}`);
        // Sanitizar el valor si es inválido
        val = String(sanitizePercentage(val));
      }
    }
    
    setForm(f => ({
      ...f,
      activities: f.activities.map((a,i) => i===idx?{...a,[field]:val}:a)
    }));
  }

  const saveUnit = () => {
    // Validar la unidad completa antes de guardar
    const validationResult = validateAcademicUnit(form);
    
    if (!validationResult.isValid) {
      alert(`Error de validación: ${validationResult.firstError}`);
      return;
    }
    
    const newUnit = { 
      ...form, 
      id: Date.now() + Math.random() // More unique ID
    }
    setUnits(u => [...u, newUnit])
    setForm({
      subject: filterSubj === 'all' ? 'poo' : filterSubj,
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      activities: [{ name: 'Examen Parcial', description: 'Descripción breve', weight: '' }]
    })
    setEditing(false)
  }
  const deleteUnit = id => setUnits(u => u.filter(x => x.id !== id))
  const startEdit = u => {
    setForm(u)
    setEditing(true)
  }
  
  // Function to calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredUnits = useMemo(
    () => filterSubj==='all'?units:units.filter(u=>u.subject===filterSubj),
    [filterSubj, units]
  )

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Registrar Unidades</Typography>
          <Typography variant="body1" color="text.secondary">Configura unidades y actividades por asignatura</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openForm}>Nueva Unidad</Button>
      </Box>

      {/* Filter */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" gutterBottom>Filtrar por Asignatura</Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredUnits.length} unidad{filteredUnits.length !== 1 ? 'es' : ''} encontrada{filteredUnits.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Select value={filterSubj} onChange={handleFilter} fullWidth>
            {subjects.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </Select>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {editing && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Agregar Nueva Unidad</Typography>
            
            {/* First row - Asignatura and Nombre */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Asignatura</Typography>
                <Select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  fullWidth
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="" disabled>Seleccionar asignatura</MenuItem>
                  {subjects.filter(s=>s.id!=='all').map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Nombre de la Unidad</Typography>
                <TextField
                  placeholder="Ej: Unidad 1 - Fundamentos"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Second row - Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Descripción de la Unidad</Typography>
              <TextField
                placeholder="Describe los temas y objetivos de esta unidad..."
                multiline
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                fullWidth
                size="small"
              />
            </Box>

            {/* Third row - Fechas */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Fecha de Inicio</Typography>
                <TextField
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Fecha de Fin</Typography>
                <TextField
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: form.startDate // La fecha de fin no puede ser anterior a la fecha de inicio
                  }}
                />
              </Grid>
            </Grid>

            {/* Activities section */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Actividades de Evaluación</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography 
                    variant="body2" 
                    color={totalWeight===100?'success.main':'error.main'}
                    sx={{ fontWeight: 500 }}
                  >
                    Total: {totalWeight}%
                  </Typography>
                  <Button 
                    variant="text" 
                    startIcon={<AddIcon />} 
                    onClick={addActivity}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    AGREGAR ACTIVIDAD
                  </Button>
                </Box>
              </Box>
              
              {form.activities.map((a, i) => (
                <Box key={i} sx={{ mb: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        placeholder="Nombre de la Actividad"
                        value={a.name}
                        onChange={e => changeActivity(i,'name',e.target.value)}
                        fullWidth
                        size="small"
                        label="Nombre de la Actividad"
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        placeholder="Descripción breve"
                        value={a.description}
                        onChange={e => changeActivity(i,'description',e.target.value)}
                        fullWidth
                        size="small"
                        label="Descripción"
                      />
                    </Grid>
                    <Grid item xs={10} sm={2}>
                      <TextField
                        placeholder="0"
                        type="number"
                        value={a.weight}
                        onChange={e => changeActivity(i,'weight',e.target.value)}
                        fullWidth
                        size="small"
                        label="Ponderación (%)"
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </Grid>
                    <Grid item xs={2} sm={1}>
                      <IconButton 
                        onClick={() => removeActivity(i)} 
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>

            {/* Action buttons */}
            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
              <Button 
                onClick={closeForm}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                CANCELAR
              </Button>
              <Button 
                variant="contained" 
                onClick={saveUnit} 
                disabled={
                  totalWeight!==100 || 
                  !form.subject || 
                  !form.name || 
                  !form.startDate || 
                  !form.endDate ||
                  form.startDate > form.endDate
                }
                sx={{ textTransform: 'none' }}
              >
                GUARDAR UNIDAD
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Units List */}
      {filteredUnits.length===0 && !editing ? (
        <Card>
          <CardContent sx={{ textAlign:'center', py:4 }}>
            <BookIcon fontSize="large" color="disabled" />
            <Typography color="text.secondary" sx={{ mt:1 }}>No hay unidades registradas</Typography>
          </CardContent>
        </Card>
      ) : (
        filteredUnits.map(u => (
          <Card key={u.id} sx={{ mb:2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box>
                  <Typography variant="h6"><BookIcon sx={{ mr:1, verticalAlign:'middle' }} />{u.name}</Typography>
                  <Typography variant="subtitle2" color="text.secondary">{subjects.find(s=>s.id===u.subject)?.name}</Typography>
                  <Box display="flex" gap={2} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="primary.main">
                      Inicio: {new Date(u.startDate).toLocaleDateString('es-ES')}
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      Fin: {new Date(u.endDate).toLocaleDateString('es-ES')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({calculateDuration(u.startDate, u.endDate)} días)
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={() => startEdit(u)}><EditIcon /></IconButton>
                  <IconButton onClick={() => deleteUnit(u.id)}><DeleteIcon /></IconButton>
                </Box>
              </Box>
              <Typography sx={{ mt:1 }}>{u.description}</Typography>
              <Typography variant="subtitle2" sx={{ mt:2 }}>Actividades de Evaluación:</Typography>
              {u.activities.map((a,i) => (
                <Box key={i} display="flex" justifyContent="space-between" p={1} sx={{ bgcolor:'#f5f5f5', borderRadius:1, my:1 }}>
                  <Box>
                    <Typography>{a.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.description}</Typography>
                  </Box>
                  <Typography fontWeight="bold">{a.weight}%</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}
