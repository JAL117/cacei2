import { useState, useEffect } from 'react'
import { getTutoradosReales } from '../api/listas.js'
import { getMateriasByTutor } from '../api/incidencias.js'
import { getIncidenciasByTutor } from '../api/incidencias.js'

export const useTutorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    tutorados: [],
    asignaturas: [],
    intervenciones: [],
    loading: true,
    error: null
  })

  const [stats, setStats] = useState({
    totalTutorados: 0,
    totalAsignaturas: 0,
    alertasActivas: 0,
    promedioGrupal: 8.2 // Este valor podría venir de otra API
  })

  useEffect(() => {
    console.log('🚀 Iniciando carga del dashboard del tutor...')
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))
      
      // Obtener el ID del tutor desde localStorage
      const tutorId = localStorage.getItem('userID')
      
      if (!tutorId) {
        throw new Error('ID del tutor no encontrado')
      }

      console.log('🔄 Cargando datos del dashboard para tutor:', tutorId)

      // Cargar datos en paralelo
      const [tutoradosData, materiasData, incidenciasData] = await Promise.all([
        getTutoradosReales(tutorId).catch(error => {
          console.error('❌ Error cargando tutorados:', error)
          return []
        }),
        getMateriasByTutor(tutorId).catch(error => {
          console.error('Error cargando materias:', error)
          return []
        }),
        getIncidenciasByTutor(tutorId).catch(error => {
          console.error('Error cargando incidencias:', error)
          return []
        })
      ])

      // Las materias ya vienen filtradas para el tutor específico
      const asignaturasDelTutor = materiasData

      // Contar alertas activas (estado PENDIENTE)
      const alertasActivas = incidenciasData.filter(incidencia => 
        incidencia.estado === 'PENDIENTE'
      ).length

      // Actualizar datos
      setDashboardData({
        tutorados: tutoradosData,
        asignaturas: asignaturasDelTutor,
        intervenciones: incidenciasData,
        loading: false,
        error: null
      })

      // Actualizar estadísticas
      setStats({
        totalTutorados: tutoradosData.length,
        totalAsignaturas: asignaturasDelTutor.length,
        alertasActivas: alertasActivas,
        promedioGrupal: 8.2 // Este valor podría calcularse dinámicamente
      })

      console.log('✅ Dashboard cargado exitosamente:', {
        tutorId: tutorId,
        tutorados: tutoradosData.length,
        asignaturas: asignaturasDelTutor.length,
        intervenciones: incidenciasData.length,
        alertasActivas: alertasActivas
      })

    } catch (error) {
      console.error('💥 Error cargando dashboard:', error)
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
