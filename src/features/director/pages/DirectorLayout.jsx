import { useState } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import Sidebar from '../../../components/Sidebar'

const sidebarItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/director/home' },
  { label: 'Gestión de Personal', icon: 'people', path: '/director/gestiondepersonal' },
  { label: 'Datos de Alumnos', icon: 'school', path: '/director/datosdealumnos' },
  { label: 'Asignar Materias', icon: 'book', path: '/director/asignarmaterias' },
  { label: 'Informes por Cohorte', icon: 'report', path: '/director/informespocohorte' },
  { label: 'Listas de Alumnos', icon: 'assignment', path: '/director/listasdealumnos' },
]

export default function DirectorLayout() {
  const [currentView, setCurrentView] = useState('Dashboard')
  const navigate = useNavigate()

  const handleNavigation = (label) => {
    setCurrentView(label)
  }

  const handleLogout = () => {
    
    localStorage.removeItem('userType')
    localStorage.removeItem('userData')
    
    navigate('/login', { replace: true })
  }

  const itemsWithHandlers = sidebarItems.map(item => ({
    ...item,
    onClick: () => navigate(item.path)
  }))

  return (
    <Sidebar 
      items={itemsWithHandlers} 
      userName="Director Principal" 
      userRole="Director"
      onLogout={handleLogout}
    >
      <Outlet />
    </Sidebar>
  )
}
