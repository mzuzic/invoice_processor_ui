import { Download } from 'lucide-react';
import { Project } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { apiService } from '../../services/api';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    try {
      await apiService.downloadProjectResults(project.id);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{project.reference}</h3>
          <StatusBadge status={project.status} size="sm" />
        </div>
        <div className="text-sm text-gray-500">
          <p>{project.documentCount} documents</p>
          <p>Created: {project.created}</p>
        </div>
        {project.status === 'completed' && (
          <div className="mt-4">
            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}