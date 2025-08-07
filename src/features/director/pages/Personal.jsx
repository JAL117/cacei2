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
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Swal from 'sweetalert2'
import { getPersonal, createPersonal, updatePersonal, deletePersonal } from '../../../api/personal'
import { validateEmail, validatePhoneNumber, validatePersonName } from '../../../utils/validations'

export default function Personal() {
  const [personal, setPersonal] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPersonal, setEditingPersonal] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    email: '',
    telefono: '',
    estado: 'Activo'
  })

  // Estado para errores de validación
  const [errors, setErrors] = useState({})

 
  useEffect(() => {
    loadPersonal()
  }, [])

  const loadPersonal = async () => {
    try {
      setLoading(true)
      const data = await getPersonal()
      setPersonal(data)
    } catch (error) {
      showSnackbar('Error al cargar el personal', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: '',
      email: '',
      telefono: '',
      estado: 'Activo'
    })
    setEditingPersonal(null)
    setErrors({}) // Limpiar errores
  }
  
  // Función para validar campos en tiempo real
  const validateField = (field, value) => {
    let error = null
    
    switch (field) {
      case 'nombre':
        error = validatePersonName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'telefono':
        error = validatePhoneNumber(value)
        break
      case 'tipo':
        if (!value) error = 'El tipo de personal es requerido'
        break
      default:
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
    return error
  }
  
  // Manejar cambios en los campos del formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const handleOpenDialog = (person = null) => {
    if (person) {
      
      setEditingPersonal(person)
      setFormData({
        nombre: person.nombre,
        tipo: person.tipo,
        email: person.email,
        telefono: person.telefono,
        estado: person.estado
      })
    } else {
  
      resetForm()
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar todos los campos antes de enviar
    const fieldsToValidate = ['nombre', 'email', 'telefono', 'tipo']
    const newErrors = {}
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    
    // Si hay errores, no enviar
    if (Object.keys(newErrors).length > 0) {
      showSnackbar('Por favor corrige los errores en el formulario', 'error')
      return
    }
    
    try {
      if (editingPersonal) {
        
        const updatedPersonal = await updatePersonal(editingPersonal.id, formData)
        setPersonal(personal.map(p => p.id === editingPersonal.id ? updatedPersonal : p))
        showSnackbar('Personal actualizado exitosamente')
      } else {
        // Convertir estado a boolean para la API
        const dataToSend = {
          ...formData,
          estado: formData.estado === 'Activo' ? true : false
        }
        const newPersonal = await createPersonal(dataToSend)
        setPersonal([...personal, newPersonal])
        showSnackbar('Personal agregado exitosamente')
      }
      
      handleCloseDialog()
    } catch (error) {
      showSnackbar('Error al guardar el personal', 'error')
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que quieres eliminar este personal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await deletePersonal(id)
        setPersonal(personal.filter(p => p.id !== id))
        showSnackbar('Personal eliminado exitosamente')
        
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El personal ha sido eliminado exitosamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        showSnackbar('Error al eliminar el personal', 'error')
        
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al eliminar el personal.',
          icon: 'error'
        })
      }
    }
  }
  return (
    <Box>
   
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Gestión de Personal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra tutores académicos y docentes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 3 }}
        >
          Agregar Personal
        </Button>
      </Box>

    
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
      
        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {personal.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                          No hay personal registrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    personal.map((person) => (
                      <TableRow key={person.id}>
                        <TableCell>{person.nombre}</TableCell>
                        <TableCell>{person.tipo}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>{person.telefono}</TableCell>
                        <TableCell>
                          <Chip 
                            label={person.estado} 
                            color={person.estado === 'Activo' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenDialog(person)}
                            title="Editar"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(person.id)}
                            title="Eliminar"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

  
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingPersonal ? 'Editar Personal' : 'Agregar Nuevo Personal'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nombre completo"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                error={!!errors.nombre}
                helperText={errors.nombre}
                required
                fullWidth
              />
              <TextField
                select
                label="Tipo"
                value={formData.tipo}
                onChange={(e) => handleInputChange('tipo', e.target.value)}
                error={!!errors.tipo}
                helperText={errors.tipo}
                required
                fullWidth
              >
                <MenuItem value="Docente">Docente</MenuItem>
                <MenuItem value="Tutor">Tutor</MenuItem>
                <MenuItem value="Director">Director</MenuItem>
              </TextField>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
                fullWidth
              />
              <TextField
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                error={!!errors.telefono}
                helperText={errors.telefono || 'Formato: 10 dígitos (ej: 5551234567)'}
                required
                fullWidth
              />
            
              {editingPersonal && (
                <TextField
                  select
                  label="Estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Activo">Activo</MenuItem>
                  <MenuItem value="Inactivo">Inactivo</MenuItem>
                </TextField>
              )}
              
           
              {!editingPersonal && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  El nuevo personal será registrado con estado <strong>Activo</strong> por defecto.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingPersonal ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

     
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
