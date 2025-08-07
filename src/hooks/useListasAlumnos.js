import { useState, useEffect, useCallback } from 'react'
import { getMateriasWithRelaciones } from '../api/materias'
import { 
  processCSVFile, 
  guardarListaAlumnos,
  guardarListaAlumnosConArchivoOriginal, 
  obtenerListasConAlumnosReales,
  validarDatosLista,
  descargarPlantillaCSV
} from '../api/listas'

/**
 * Hook personalizado para manejar la lógica de listas de alumnos
 * Separa la lógica de negocio de la vista
 */
export const useListasAlumnos = () => {
  // Estados principales
  const [listas, setListas] = useState([])
  const [materias, setMaterias] = useState([])
  const [gruposDisponibles, setGruposDisponibles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    asignatura: '',
    grupo: '',
    profesor: ''
  })
  const [uploadedFile, setUploadedFile] = useState(null)
  const [processedAlumnos, setProcessedAlumnos] = useState([])

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 useListasAlumnos: Cargando datos iniciales...')
        
        // Cargar materias y listas en paralelo
        const [materiasData, listasData] = await Promise.all([
          getMateriasWithRelaciones(),
          obtenerListasConAlumnosReales().catch((err) => {
            console.warn('⚠️ No se pudieron cargar las listas con alumnos reales:', err.message)
            return [] // Si falla, usar array vacío
          })
        ])
        
        console.log('📊 useListasAlumnos: Materias cargadas:', materiasData.length)
        console.log('📋 useListasAlumnos: Listas cargadas:', listasData.length)
        
        setMaterias(materiasData)
        setListas(listasData)
        
        console.log('✅ useListasAlumnos: Datos iniciales cargados')
        
      } catch (err) {
        console.error('💥 useListasAlumnos: Error cargando datos:', err)
        setError('Error al cargar los datos. Por favor, intente de nuevo.')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  // Actualizar grupos cuando se selecciona una materia
  useEffect(() => {
    if (formData.asignatura) {
      const materiaSeleccionada = materias.find(m => m.id === parseInt(formData.asignatura))
      if (materiaSeleccionada && materiaSeleccionada.grupos) {
        console.log('🔍 useListasAlumnos: Grupos disponibles:', materiaSeleccionada.grupos)
        setGruposDisponibles(materiaSeleccionada.grupos)
        // Limpiar selección de grupo y profesor
        setFormData(prev => ({ ...prev, grupo: '', profesor: '' }))
      } else {
        setGruposDisponibles([])
      }
    } else {
      setGruposDisponibles([])
    }
  }, [formData.asignatura, materias])

  // Actualizar profesor cuando se selecciona un grupo
  useEffect(() => {
    if (formData.grupo) {
      const grupo = gruposDisponibles.find(g => g.id === parseInt(formData.grupo))
      if (grupo && grupo.profesor) {
        const profesorNombre = typeof grupo.profesor === 'object' 
          ? `${grupo.profesor.nombre} ${grupo.profesor.apellido || ''}`.trim()
          : grupo.profesor
        
        console.log('🔍 useListasAlumnos: Profesor asignado:', profesorNombre)
        setFormData(prev => ({ ...prev, profesor: profesorNombre }))
      } else {
        setFormData(prev => ({ ...prev, profesor: '' }))
      }
    }
  }, [formData.grupo, gruposDisponibles])

  // Funciones de manejo
  const handleFileUpload = useCallback(async (file) => {
    try {
      setUploading(true)
      setError(null)
      
      console.log('📤 useListasAlumnos: Procesando archivo:', file.name)
      
      const alumnos = await processCSVFile(file)
      setUploadedFile(file)
      setProcessedAlumnos(alumnos)
      
      console.log('✅ useListasAlumnos: Archivo procesado exitosamente')
      
    } catch (err) {
      console.error('💥 useListasAlumnos: Error procesando archivo:', err)
      setError(err.message)
      setUploadedFile(null)
      setProcessedAlumnos([])
    } finally {
      setUploading(false)
    }
  }, [])

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    try {
      setUploading(true)
      setError(null)
      
      // Obtener información completa del grupo seleccionado para obtener el tutor_id
      const grupoSeleccionado = gruposDisponibles.find(g => g.id === parseInt(formData.grupo))
      
      if (!grupoSeleccionado) {
        throw new Error('No se pudo encontrar la información del grupo seleccionado')
      }
      
      // Obtener el ID del tutor/profesor
      const tutorId = grupoSeleccionado.profesor_id || grupoSeleccionado.profesor?.id
      
      if (!tutorId) {
        throw new Error('No se pudo obtener el ID del tutor/profesor')
      }
      
      // Preparar datos para validación
      const listaData = {
        materiaId: parseInt(formData.asignatura),
        grupoId: parseInt(formData.grupo),
        tutorId: tutorId,
        alumnos: processedAlumnos,
        archivoOriginal: uploadedFile // Incluir archivo original para opción alternativa
      }
      
      // Validar datos
      const validacion = validarDatosLista(listaData)
      if (!validacion.esValido) {
        throw new Error(validacion.errores.join('\n'))
      }
      
      console.log('💾 useListasAlumnos: Guardando lista:', {
        ...listaData,
        alumnosCount: listaData.alumnos.length,
        profesor: formData.profesor,
        archivoOriginal: uploadedFile?.name
      })
      
      // OPCIÓN 1: Guardar generando nuevo CSV desde los datos procesados (actual)
      const listaGuardada = await guardarListaAlumnos(listaData)
      
      // OPCIÓN 2: Alternativamente, usar el archivo original del usuario
      // const listaGuardada = await guardarListaAlumnosConArchivoOriginal(listaData)
      
      console.log('✅ useListasAlumnos: Lista guardada exitosamente:', listaGuardada)
      
      // Recargar listas desde el servidor para mostrar datos actualizados
      try {
        const listasActualizadas = await obtenerListasConAlumnosReales()
        setListas(listasActualizadas)
        console.log('🔄 useListasAlumnos: Listas recargadas desde servidor con alumnos reales')
      } catch (reloadError) {
        console.warn('⚠️ Error recargando listas, actualizando solo localmente:', reloadError.message)
        
        // Fallback: actualizar solo localmente si falla la recarga
        const materiaSeleccionada = materias.find(m => m.id === parseInt(formData.asignatura))
        
        const nuevaLista = {
          id: listaGuardada.id || Date.now(), 
          asignatura: materiaSeleccionada?.nombre || 'Materia desconocida',
          grupo: grupoSeleccionado?.numero || 0,
          profesor: formData.profesor,
          alumnos: processedAlumnos
        }
        
        setListas(prev => [...prev, nuevaLista])
      }
      
      // Limpiar formulario
      resetForm()
      
      console.log('✅ useListasAlumnos: Lista guardada exitosamente')
      
      return { success: true, mensaje: 'Lista guardada exitosamente' }
      
    } catch (err) {
      console.error('💥 useListasAlumnos: Error guardando lista:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setUploading(false)
    }
  }, [formData, processedAlumnos, materias, gruposDisponibles])

  const resetForm = useCallback(() => {
    setFormData({ asignatura: '', grupo: '', profesor: '' })
    setUploadedFile(null)
    setProcessedAlumnos([])
    setError(null)
  }, [])

  const reloadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 useListasAlumnos: Recargando datos...')
      
      const [materiasData, listasData] = await Promise.all([
        getMateriasWithRelaciones(),
        obtenerListasConAlumnosReales().catch((err) => {
          console.warn('⚠️ Error recargando listas con alumnos reales:', err.message)
          return []
        })
      ])
      
      console.log('📊 useListasAlumnos: Datos recargados - Materias:', materiasData.length, 'Listas:', listasData.length)
      
      setMaterias(materiasData)
      setListas(listasData)
      
    } catch (err) {
      console.error('💥 useListasAlumnos: Error recargando datos:', err)
      setError('Error al recargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  const downloadTemplate = useCallback(() => {
    try {
      descargarPlantillaCSV()
    } catch (err) {
      setError('Error al descargar la plantilla')
    }
  }, [])

  // Estado del formulario
  const isFormValid = formData.asignatura && 
                     formData.grupo && 
                     formData.profesor && 
                     processedAlumnos.length > 0

  const isFormDisabled = materias.length === 0 || uploading

  return {
    // Estados
    listas,
    materias,
    gruposDisponibles,
    formData,
    uploadedFile,
    processedAlumnos,
    loading,
    error,
    uploading,
    
    // Estados computados
    isFormValid,
    isFormDisabled,
    
    // Funciones
    handleFileUpload,
    handleFormChange,
    handleSubmit,
    resetForm,
    reloadData,
    downloadTemplate,
    
    // Utilidades
    setError
  }
}
