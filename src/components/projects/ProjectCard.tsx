import { Project } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
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
      </div>
    </div>
  );
}