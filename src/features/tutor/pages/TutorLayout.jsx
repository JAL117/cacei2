import { Outlet } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const sidebarItems = [
  { label: 'Panel', icon: 'dashboard', path: '/tutor/home' },
  { label: 'Listas de Asistencia', icon: 'assignment', path: '/tutor/listas-asistencia' },
  { label: 'Registrar Unidades', icon: 'book', path: '/tutor/registrar-unidades' },
  { label: 'Calificaciones', icon: 'grade', path: '/tutor/calificaciones' },
  { label: 'Trayectoria Escolar', icon: 'timeline', path: '/tutor/trayectoria-escolar' },
  { label: 'Intervenciones', icon: 'warning', path: '/tutor/incidencias' },
  { label: 'Tutorías', icon: 'group', path: '/tutor/tutorias-grupales' },
];

export default function TutorLayout() {
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
  let userName = "Tutor Académico";
  if (currentPath.startsWith('/director')) userName = "Director Principal";
  return (
    <Sidebar items={itemsWithHandlers} onLogout={handleLogout} userName={userName} userRole="Tutor">
      <Outlet />
    </Sidebar>
  );
}
