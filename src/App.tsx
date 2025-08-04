import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProjectHub } from './components/projects/ProjectHub';
import { ProjectDetailPage } from './components/projects/ProjectDetailPage';

export default function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'project'>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const navigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project');
  };

  const navigateHome = () => {
    setCurrentPage('home');
    setSelectedProjectId(null);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setSelectedProjectId(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  if (currentPage === 'project' && selectedProjectId) {
    return (
      <ProjectDetailPage 
        projectId={selectedProjectId} 
        onBack={navigateHome} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <ProjectHub 
      onNavigateToProject={navigateToProject} 
      onLogout={handleLogout} 
    />
  );
}