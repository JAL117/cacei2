import React, { useMemo } from 'react'
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
  CircularProgress,
  Alert
} from '@mui/material'
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  MenuBook as BookIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material'
import { useUnidadesActividades } from '../../../hooks/useUnidadesActividades'

export default function RegistrarUnidades() {
  const {
    // Estados
    materias,
    units,
    loading,
    error,
    saving,
    editing,
    editingId,
    filterSubj,
    form,
    
    // Valores calculados
    subjectOptions,
    totalWeight,
    filteredUnits,
    
    // Funciones
    setError,
    handleFilter,
    openForm,
    closeForm,
    addActivity,
    removeActivity,
    changeActivity,
    saveUnit,
    getMateriaName,
    setForm,
    loadInitialData,
    reloadUnits
  } = useUnidadesActividades()

  // Debug: Monitorear el estado del componente
  console.log('🎯 RegistrarUnidades - Estado actual:', {
    materiasCount: materias.length,
    unitsCount: units.length,
    filteredUnitsCount: filteredUnits.length,
    filterSubj,
    loading,
    editing,
    filteredUnits: filteredUnits.map(u => ({ 
      id: u.id, 
      name: u.name, 
      subject: u.subject,
      numero_unidad: u.numero_unidad 
    }))
  })

  // Mostrar loading si está cargando datos iniciales
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="h6">
          Cargando materias del profesor...
        </Typography>
      </Box>
    )
  }

  // Mostrar error si no se pudo cargar los datos
  if (error && materias.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={loadInitialData}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    )
  }

  // Si no hay materias asignadas al profesor
  if (!loading && materias.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes materias asignadas. Contacta al director para que te asigne materias y grupos.
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Registrar Unidades</Typography>
          <Typography variant="body1" color="text.secondary">
            Configura unidades y actividades por asignatura ({materias.length} materias asignadas)
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={() => {
              console.log('🔄 Recargando datos manualmente')
              loadInitialData()
            }}
            size="small"
          >
            Recargar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={openForm}
            disabled={materias.length === 0}
          >
            Nueva Unidad
          </Button>
        </Box>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" gutterBottom>Filtrar por Asignatura</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredUnits.length} unidad{filteredUnits.length !== 1 ? 'es' : ''} encontrada{filteredUnits.length !== 1 ? 's' : ''}
              </Typography>
              <Button 
                variant="text" 
                startIcon={<RefreshIcon />} 
                onClick={() => {
                  console.log('🔄 Recargando unidades del filtro actual')
                  reloadUnits()
                }}
                size="small"
              >
                Recargar Unidades
              </Button>
            </Box>
          </Box>
          <Select value={filterSubj} onChange={(e) => handleFilter(e.target.value)} fullWidth>
            {subjectOptions.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </Select>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {editing && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingId ? 'Editar Unidad' : 'Agregar Nueva Unidad'}
            </Typography>
            
            {/* First row - Asignatura, Número de Unidad y Nombre */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Asignatura</Typography>
                <Select
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  fullWidth
                  size="small"
                  displayEmpty
                >
                  <MenuItem value="" disabled>Seleccionar asignatura</MenuItem>
                  {materias.map(materia => (
                    <MenuItem key={materia.id} value={materia.id}>
                      {materia.nombre} - Cuatrimestre {materia.cuatrimestre}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Número de Unidad</Typography>
                <TextField
                  type="number"
                  value={form.numeroUnidad}
                  onChange={e => setForm(f => ({ ...f, numeroUnidad: e.target.value }))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1, max: 20 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Nombre de la Unidad</Typography>
                <TextField
                  placeholder="Ej: Introducción al Desarrollo Web"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Third row - Description */}
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
                    Total: {Number(totalWeight).toFixed(totalWeight % 1 === 0 ? 0 : 1)}%
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
                  totalWeight !== 100 || 
                  !form.subject || 
                  !form.name || 
                  !form.numeroUnidad ||
                  !form.description.trim() ||
                  saving
                }
                sx={{ textTransform: 'none' }}
              >
                {saving ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Guardando...
                  </>
                ) : (
                  'GUARDAR UNIDAD'
                )}
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
                  <Typography variant="h6">
                    <BookIcon sx={{ mr:1, verticalAlign:'middle' }} />
                    Unidad {u.numero_unidad}: {u.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {getMateriaName(u.subject)}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => console.log('Editar:', u.id)} disabled>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => console.log('Eliminar:', u.id)} disabled>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography sx={{ mt:1 }}>{u.description}</Typography>
              <Typography variant="subtitle2" sx={{ mt:2 }}>Actividades de Evaluación:</Typography>
              {u.activities.map((a,i) => (
                <Box key={i} display="flex" justifyContent="space-between" p={1} sx={{ bgcolor:'#f5f5f5', borderRadius:1, my:1 }}>
                  <Box>
                    <Typography>{a.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.name} - {a.description}</Typography>
                  </Box>
                  <Typography fontWeight="bold">{Number(a.weight).toFixed(a.weight % 1 === 0 ? 0 : 1)}%</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}
