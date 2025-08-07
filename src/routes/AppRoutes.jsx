import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../features/auth/pages/Login';
// Director
import DirectorLayout from '../features/director/pages/DirectorLayout';
import Dashboard from '../features/director/pages/Dashboard';
import Alumnos from '../features/director/pages/Alumnos';
import Cohorte from '../features/director/pages/Cohorte';
import ListasAlumnos from '../features/director/pages/ListasAlumnos';
import Materias from '../features/director/pages/Materias';
import Personal from '../features/director/pages/Personal';
// Docente
import DocenteLayout from '../features/docente/pages/DocenteLayout';
import DocenteHome from '../features/docente/pages/DocenteHome';
import CalificacionesDocente from '../features/docente/pages/Calificaciones';
import DisenoInstruccional from '../features/docente/pages/DisenoInstruccional';
import ListaAsistencia from '../features/docente/pages/ListaAsistencia';
import RegistrarUnidadesDocente from '../features/docente/pages/RegistrarUnidades';
import ReportarIncidencia from '../features/docente/pages/ReportarIncidencia';
// Tutor
import TutorLayout from '../features/tutor/pages/TutorLayout';
import TutorHome from '../features/tutor/pages/TutorHome';
import CalificacionesTutor from '../features/tutor/pages/Calificaciones';
import Incidencias from '../features/tutor/pages/Incidencias';
import ListasAsistenciaTutor from '../features/tutor/pages/ListasAsistencia';
import RegistrarUnidadesTutor from '../features/tutor/pages/RegistrarUnidades';
import TrayectoriaEscolar from '../features/tutor/pages/TrayectoriaEscolar';
import TutoriasGrupales from '../features/tutor/pages/TutoriasGrupales';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/director" element={<DirectorLayout />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gestiondepersonal" element={<Personal />} />
          <Route path="datosdealumnos" element={<Alumnos />} />
          <Route path="asignarmaterias" element={<Materias />} />
          <Route path="informespocohorte" element={<Cohorte />} />
          <Route path="listasdealumnos" element={<ListasAlumnos />} />
        </Route>
        <Route path="/docente" element={<DocenteLayout />}>
          <Route path="home" element={<DocenteHome />} />
          <Route path="calificaciones" element={<CalificacionesDocente />} />
          <Route path="diseno-instruccional" element={<DisenoInstruccional />} />
          <Route path="lista-asistencia" element={<ListaAsistencia />} />
          <Route path="registrar-unidades" element={<RegistrarUnidadesDocente />} />
          <Route path="reportar-incidencia" element={<ReportarIncidencia />} />
        </Route>
        <Route path="/tutor" element={<TutorLayout />}>
          <Route path="home" element={<TutorHome />} />
          <Route path="calificaciones" element={<CalificacionesTutor />} />
          <Route path="incidencias" element={<Incidencias />} />
          <Route path="listas-asistencia" element={<ListasAsistenciaTutor />} />
          <Route path="registrar-unidades" element={<RegistrarUnidadesTutor />} />
          <Route path="trayectoria-escolar" element={<TrayectoriaEscolar />} />
          <Route path="tutorias-grupales" element={<TutoriasGrupales />} />
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
