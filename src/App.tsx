import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProjectHub } from './components/projects/ProjectHub';
import { ProjectDetailPage } from './components/projects/ProjectDetailPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function AppRoutes() {
  const navigate = useNavigate();

  const navigateToProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const navigateHome = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={
        <ProtectedRoute>
          <ProjectHub onNavigateToProject={navigateToProject} />
        </ProtectedRoute>
      } />
      <Route path="/project/:projectId" element={
        <ProtectedRoute>
          <ProjectDetailPageWrapper onBack={navigateHome} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProjectDetailPageWrapper({ onBack }: { onBack: () => void }) {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    return <Navigate to="/" replace />;
  }
  
  return <ProjectDetailPage projectId={projectId} onBack={onBack} />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}