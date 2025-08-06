import { useState, useEffect } from 'react';
import { Plus, Loader2, LogOut } from 'lucide-react';
import { Project } from '../../types';
import { apiService } from '../../services/api';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectHubProps {
  onNavigateToProject: (projectId: string) => void;
}

export function ProjectHub({ onNavigateToProject }: ProjectHubProps) {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData = await apiService.fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (reference: string) => {
    try {
      const newProject = await apiService.createProject(reference);
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      onNavigateToProject(newProject.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            {user && (
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user.name} ({user.role})
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              onClick={() => setShowCreateModal(true)}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <div className="px-4 py-5 sm:p-6 h-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700">
                <Plus className="h-12 w-12 mb-2" />
                <span className="text-lg font-medium">Create Project</span>
              </div>
            </div>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => onNavigateToProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}