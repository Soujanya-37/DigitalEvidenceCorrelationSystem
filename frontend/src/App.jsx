import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ArchitecturePage from './pages/ArchitecturePage';
import VivaGuidePage from './pages/VivaGuidePage';
import SimulatorPage from './pages/SimulatorPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateCasePage from './pages/CreateCasePage';
import CasesPage from './pages/CasesPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import UploadEvidencePage from './pages/UploadEvidencePage';
import TimelinePage from './pages/TimelinePage';
import AiAnalysisPage from './pages/AiAnalysisPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute() {
  const location = useLocation();
  return localStorage.getItem('token') ? <Layout /> : <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="/viva-guide" element={<VivaGuidePage />} />
      <Route path="/simulator" element={<SimulatorPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-case" element={<CreateCasePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/:id" element={<CaseDetailsPage />} />
        <Route path="/upload-evidence" element={<UploadEvidencePage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/ai-analysis" element={<AiAnalysisPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
