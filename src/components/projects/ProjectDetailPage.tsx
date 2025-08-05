import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { Project } from '../../types';
import { apiService } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { DraftView } from '../upload/DraftView';
import { ProcessingView } from '../upload/ProcessingView';
import { useAuth } from '../../hooks/useAuth';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailPageProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  useEffect(() => {
    if (project?.status === 'processing') {
      // TODO use web sockets for this
      const interval = setInterval(fetchProjectDetails, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [project?.status]);

  const fetchProjectDetails = async () => {
    try {
      const projectData = await apiService.fetchProjectDetails(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleStartProcessing = async () => {
    if (!project || uploadedFiles.length === 0) return;

    try {
      // First upload the files
      console.log('Uploading files...');
      await apiService.uploadFiles(project.id, uploadedFiles);

      // Then start processing
      console.log('Starting processing...');
      await apiService.startProcessing(project.id);

      // Update project status and clear uploaded files
      setProject({ ...project, status: 'processing' });
      setUploadedFiles([]);

      console.log('Processing started successfully');
    } catch (error) {
      console.error('Failed to start processing:', error);
      alert(`Failed to start processing: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center"
            >
              ← Back to Projects
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{project.reference}</h1>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {project.status === 'draft' ? (
          <DraftView
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onStartProcessing={handleStartProcessing}
          />
        ) : (
          <ProcessingView documents={project.documents || []} />
        )}
      </div>
    </div>
  );
}