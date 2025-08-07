import React, { useMemo } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Paper,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material'
import { Save as SaveIcon, School as SchoolIcon, Person as PersonIcon } from '@mui/icons-material'
import { useCalificaciones } from '../../../hooks/useCalificaciones'

export default function Calificaciones() {
  const {
    // Estados
    materias,
    units,
    estudiantes,
    loading,
    error,
    selectedSubject,
    selectedUnit,
    gradesData,
    calculatedGrades,
    showSaveMessage,
    gradeErrors,
    
    // Valores calculados
    subjectOptions,
    selectedUnitData,
    
    // Funciones
    setError,
    setSelectedUnit,
    handleSubjectChange,
    handleGradeChange,
    handleBlur,
    handleSaveGrades,
    getGradeColor,
    loadInitialData
  } = useCalificaciones()

  // Debug: Monitorear el estado del componente
  console.log('🎯 Calificaciones - Estado actual:', {
    materiasCount: materias.length,
    unitsCount: units.length,
    estudiantesCount: estudiantes.length,
    selectedSubject,
    selectedUnit,
    loading,
    selectedUnitData
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
          Cargando datos de calificaciones...
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
          <Typography variant="h4" fontWeight="bold">Calificaciones</Typography>
          <Typography variant="body1" color="text.secondary">
            Registra y visualiza calificaciones de tus tutorados ({materias.length} materias asignadas)
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSaveGrades}
          disabled={Object.keys(gradesData).length === 0}
        >
          Guardar Calificaciones
        </Button>
      </Box>

      {/* Mensaje de guardado exitoso */}
      {showSaveMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Las calificaciones han sido guardadas exitosamente.
        </Alert>
      )}

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Selector de asignatura */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Selecciona una Asignatura</Typography>
          <Select
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>Seleccionar asignatura</MenuItem>
            {subjectOptions.map(subject => (
              <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
            ))}
          </Select>
          
          {/* Selector de unidad */}
          {units.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>Selecciona una Unidad</Typography>
              <Select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                fullWidth
                size="small"
                displayEmpty
              >
                <MenuItem value="" disabled>Seleccionar unidad</MenuItem>
                {units.map(unit => (
                  <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                ))}
              </Select>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabla de calificaciones */}
      {selectedUnitData ? (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Matrícula</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Estudiante</TableCell>
                
                {selectedUnitData.activities.map((activity, index) => (
                  <TableCell 
                    key={`${activity.name}-${index}`}
                    align="center"
                    sx={{ fontWeight: 'bold' }}
                  >
                    <Tooltip title={`${activity.description} (${activity.weight}%)`}>
                      <span>{activity.name}</span>
                    </Tooltip>
                  </TableCell>
                ))}
                
                <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Calificación Final
                </TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {estudiantes.map(student => (
                <TableRow 
                  key={student.id}
                  sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>{student.matricula}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                      {student.name}
                    </Box>
                  </TableCell>
                  
                  {selectedUnitData.activities.map((activity, activityIndex) => {
                    const errorKey = `${student.id}_${selectedUnitData.id}_${activity.name}`;
                    const hasError = !!gradeErrors[errorKey];
                    const currentValue = gradesData[student.id]?.[selectedUnitData.id]?.[activity.name] || '';
                    
                    return (
                      <TableCell 
                        key={`${student.id}-${activity.name}-${activityIndex}`}
                        align="center"
                        sx={{ p: 1 }}
                      >
                        <Tooltip 
                          title={hasError ? gradeErrors[errorKey] : ''} 
                          open={hasError}
                          arrow
                          placement="top"
                        >
                          <TextField
                            value={currentValue}
                            onChange={(e) => handleGradeChange(student.id, activity.name, e.target.value)}
                            onBlur={() => handleBlur(student.id, activity.name)}
                            error={hasError}
                            inputProps={{ 
                              style: { textAlign: 'center' },
                              maxLength: 3
                            }}
                            size="small"
                            variant="standard"
                            sx={{ 
                              width: '60px',
                              '& .MuiInput-underline:after': {
                                borderBottomColor: hasError ? 'error.main' : 'primary.main'
                              }
                            }}
                            placeholder="0-100"
                          />
                        </Tooltip>
                      </TableCell>
                    )
                  })}
                  
                  <TableCell 
                    align="center"
                    sx={{ 
                      p: 1,
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      color: getGradeColor(calculatedGrades[student.id]?.[selectedUnitData.id])
                    }}
                  >
                    {calculatedGrades[student.id]?.[selectedUnitData.id] !== null
                      ? calculatedGrades[student.id]?.[selectedUnitData.id]
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card>
          <CardContent sx={{ textAlign:'center', py:4 }}>
            <SchoolIcon fontSize="large" color="disabled" />
            <Typography variant="h6" color="text.secondary" sx={{ mt:1, mb:1 }}>
              {units.length === 0 ? 'No hay unidades registradas para esta asignatura' : 'Selecciona una unidad para calificar'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {units.length === 0 
                ? 'Para poder calificar, primero debes registrar unidades en el módulo de "Registrar Unidades"'
                : 'Elige una unidad específica del dropdown superior para comenzar a calificar'
              }
            </Typography>
            {units.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt:1 }}>
                Las unidades deben incluir actividades con sus respectivos porcentajes de calificación
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}