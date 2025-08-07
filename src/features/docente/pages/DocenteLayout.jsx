import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/docente/home' },
  { label: 'Lista de Asistencia', icon: 'assignment', path: '/docente/lista-asistencia' },
  { label: 'Registrar Unidades', icon: 'book', path: '/docente/registrar-unidades' },
  { label: 'Calificaciones', icon: 'school', path: '/docente/calificaciones' },
  { label: 'Reportar Incidencia', icon: 'report', path: '/docente/reportar-incidencia' },
  { label: 'Diseño Instruccional', icon: 'people', path: '/docente/diseno-instruccional' },
];

export default function DocenteLayout() {
  const navigate = useNavigate();
  const itemsWithHandlers = sidebarItems.map(item => ({
    ...item,
    onClick: () => navigate(item.path)
  }));
  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    navigate('/login', { replace: true });
  };

  const currentPath = window.location.pathname;
  let userName = "Docente";
  if (currentPath.startsWith('/director')) userName = "Director Principal";
  if (currentPath.startsWith('/tutor')) userName = "Tutor Académico";
  return (
    <Sidebar items={itemsWithHandlers} onLogout={handleLogout} userName={userName} userRole="Docente">
      <Outlet />
    </Sidebar>
  );
}
