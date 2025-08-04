import { Project, Document } from '../types';
import { config } from '../config';

class ApiService {

  async fetchProjects(): Promise<Project[]> {
    // Simulated API call - replace with actual implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', reference: 'PO-2024-001', status: 'completed', documentCount: 3, created: '5 minutes ago' },
          { id: '2', reference: 'PO-2024-002', status: 'processing', documentCount: 2, created: '2 hours ago' },
          { id: '3', reference: 'Invoice-Batch-03', status: 'draft', documentCount: 0, created: '1 day ago' },
        ]);
      }, 500);
    });
  }

  async createProject(reference?: string): Promise<Project> {
    // Simulated API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          reference: reference || `Project-${Date.now()}`,
          status: 'draft',
          documentCount: 0,
          created: 'Just now'
        });
      }, 300);
    });
  }

  async fetchProjectDetails(projectId: string): Promise<Project> {
    // Simulated API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: projectId,
          reference: 'PO-2024-001',
          status: 'processing',
          documentCount: 2,
          created: '2 hours ago',
          documents: [
            {
              id: '1',
              filename: 'invoice1.pdf',
              type: 'Invoice',
              vendor: 'Acme Corp',
              status: 'processed',
              jobId: 'job-1'
            },
            {
              id: '2',
              filename: 'invoice2.pdf',
              type: 'Invoice',
              vendor: undefined,
              status: 'processing',
              jobId: 'job-2'
            }
          ]
        });
      }, 300);
    });
  }

  async uploadFiles(_projectId: string, files: File[]): Promise<Document[]> {
    // Simulated file upload
    return new Promise((resolve) => {
      setTimeout(() => {
        const documents = files.map((file, index) => ({
          id: `doc-${Date.now()}-${index}`,
          filename: file.name,
          type: 'Invoice',
          status: 'queued' as const,
          jobId: `job-${Date.now()}-${index}`
        }));
        resolve(documents);
      }, 1000);
    });
  }

  async startProcessing(_projectId: string): Promise<void> {
    // Simulated processing start
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
}

export const apiService = new ApiService();