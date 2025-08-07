import { useState, useEffect } from 'react'
import { getMateriasByTutor } from '../api/incidencias.js'
import { getIncidenciasByTutor } from '../api/incidencias.js'
import { getAlumnosRegistrados } from '../api/listas.js'

export const useDocenteDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    materias: [],
    alumnos: [],
    intervenciones: [],
    loading: true,
    error: null
  })

  const [stats, setStats] = useState({
    totalMaterias: 0,
    totalAlumnos: 0,
    totalIntervenciones: 0,
    promedioGeneral: 8.5 // Este valor podría venir de otra API
  })

  useEffect(() => {
    console.log('🚀 Iniciando carga del dashboard del docente...')
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))
      
      // Obtener el ID del docente desde localStorage
      const docenteId = localStorage.getItem('userID')
      
      if (!docenteId) {
        throw new Error('ID del docente no encontrado')
      }

      console.log('🔄 Cargando datos del dashboard para docente:', docenteId)

      // Cargar datos en paralelo
      const [materiasData, alumnosData, incidenciasData] = await Promise.all([
        getMateriasByTutor(docenteId).catch(error => {
          console.error('❌ Error cargando materias del docente:', error)
          return []
        }),
        getAlumnosRegistrados().catch(error => {
          console.error('❌ Error cargando alumnos:', error)
          return []
        }),
        getIncidenciasByTutor(docenteId).catch(error => {
          console.error('❌ Error cargando incidencias del docente:', error)
          return []
        })
      ])

      console.log('📊 Datos del docente cargados:', {
        materias: materiasData.length,
        alumnos: alumnosData.length, 
        incidencias: incidenciasData.length
      })

      // Actualizar datos
      setDashboardData({
        materias: materiasData,
        alumnos: alumnosData,
        intervenciones: incidenciasData,
        loading: false,
        error: null
      })

      // Actualizar estadísticas
      setStats({
        totalMaterias: materiasData.length,
        totalAlumnos: alumnosData.length,
        totalIntervenciones: incidenciasData.length,
        promedioGeneral: 8.5 // Este valor podría calcularse dinámicamente
      })

      console.log('✅ Dashboard del docente cargado exitosamente:', {
        docenteId: docenteId,
        materias: materiasData.length,
        alumnos: alumnosData.length,
        intervenciones: incidenciasData.length
      })

    } catch (error) {
      console.error('💥 Error cargando dashboard del docente:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar los datos del dashboard'
      }))
    }
  }

  const reloadData = () => {
    loadDashboardData()
  }

  return {
    ...dashboardData,
    stats,
    reloadData
  }
}
