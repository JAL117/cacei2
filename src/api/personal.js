import axios from 'axios'

// API functions for Personal management

const API_BASE_URL = 'http://localhost:3001'

// Obtener todo el personal
export const getPersonal = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuarios/listar`)
    // Verificar si la API devuelve el mensaje de "No se encontraron usuarios"
    if (response.data.message === 'No se encontraron usuarios') {
      console.log('Aun no se han agregado usuarios')
      return []
    }
    
    return response.data
  } catch (error) {
    // Verificar si es un error 404 con el mensaje específico
    if (error.response && error.response.status === 404) {
      if (error.response.data && error.response.data.message === 'No se encontraron usuarios') {
        console.log('Aun no se han agregado usuarios')
        return []
      }
    }
    
    console.error('Error fetching personal:', error)
  }
}



// Crear nuevo personal
export const createPersonal = async (personalData) => {
  try {
    
    const response = await axios.post(`${API_BASE_URL}/usuarios/crear`, {
      nombre: personalData.nombre,
      email: personalData.email,
      telefono: personalData.telefono,
      estado: 'Activo',
      tipo: personalData.tipo 
    })
    
    // Si la API devuelve datos incompletos, construir el objeto completo
    const newPersonal = {
      id: response.data.id || Date.now(),
      nombre: personalData.nombre,
      email: personalData.email,
      telefono: personalData.telefono,
      tipo: personalData.tipo,
      estado: 'Activo',
      ...response.data // Sobrescribir con cualquier dato adicional de la API
    }
    
    return newPersonal
  } catch (error) {
    console.error('Error creating personal:', error)
    return null
  }
}

// Actualizar personal
export const updatePersonal = async (id, personalData) => {
  try {
    const dataToSend = {
      nombre: personalData.nombre,
      email: personalData.email,
      telefono: personalData.telefono,
      estado: personalData.estado === 'Activo' ? true : false,
      tipo: personalData.tipo
    }
    
    const response = await axios.put(`${API_BASE_URL}/usuarios/${id}`, dataToSend)
    
    // Construir el objeto completo con todos los campos actualizados
    const updatedPersonal = {
      id: id,
      nombre: personalData.nombre,
      email: personalData.email,
      telefono: personalData.telefono,
      tipo: personalData.tipo,
      estado: personalData.estado, // Mantener como string para el frontend
      ...response.data // Sobrescribir con cualquier dato adicional de la API
    }
    
    return updatedPersonal
  } catch (error) {
    console.error('Error updating personal:', error)
    return null
  }
}

// Eliminar personal
export const deletePersonal = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/usuarios/${id}`)
    return true
  } catch (error) {
    console.error('Error deleting personal:', error)
    return false
  }
}

// Login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/usuarios/login`, credentials)
    return response.data
  } catch (error) {
    console.error('Error in login:', error)
    throw error
  }
}

// Recuperar contraseña
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/usuarios/recuperar-contrasena`, { email })
    return response.data
  } catch (error) {
    console.error('Error in forgot password:', error)
    throw error
  }
}
