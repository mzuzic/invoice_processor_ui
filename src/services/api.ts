import { 
  Project, 
  Document, 
  Job,
  CreateOrderRequest,
  CreateOrderResponse,
  UploadDocumentsResponse,
  ProcessOrderRequest,
  ProcessOrderResponse
} from '../types';
import { config } from '../config';

class ApiService {
  private baseUrl = config.apiUrl;

  async fetchProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Handle paginated response structure
      const orders = result.data || [];
      
      // Transform API response to match our Project interface
      return orders.map((order: any) => ({
        id: order.id,
        reference: order.reference,
        status: this.mapOrderStatus(order.status),
        documentCount: order.documents_count || 0,
        created: this.formatDate(order.created_at),
        notes: order.notes
      }));
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Fallback to empty array for demo
      return [];
    }
  }

  async createProject(reference: string, notes?: string): Promise<Project> {
    try {
      const requestBody: CreateOrderRequest = {
        reference: reference || `Project-${Date.now()}`,
        ...(notes && { notes })
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const order: CreateOrderResponse = await response.json();
      
      return {
        id: order.id,
        reference: order.reference,
        status: this.mapOrderStatus(order.status),
        documentCount: 0,
        created: 'Just now',
        notes
      };
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  async fetchProjectDetails(projectId: string): Promise<Project> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${projectId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const order = await response.json();
      
      return {
        id: order.id,
        reference: order.reference,
        status: this.mapOrderStatus(order.status),
        documentCount: order.documents?.length || 0,
        created: this.formatDate(order.created_at),
        documents: order.documents?.map((doc: any) => ({
          id: doc.id,
          file_name: doc.file_name,
          document_type: doc.document_type,
          vendor: doc.vendor,
          status: this.mapDocumentStatus(doc.status),
          job_id: doc.job_id
        })) || [],
        notes: order.notes
      };
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      throw error;
    }
  }

  async uploadFiles(projectId: string, files: File[]): Promise<Document[]> {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseUrl}/orders/${projectId}/documents`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: UploadDocumentsResponse = await response.json();
      
      return result.documents_added.map(doc => ({
        id: doc.id,
        file_name: doc.file_name,
        document_type: doc.document_type,
        vendor: doc.vendor,
        status: this.mapDocumentStatus(doc.status),
        job_id: doc.job_id
      }));
    } catch (error) {
      console.error('Failed to upload files:', error);
      throw error;
    }
  }

  async startProcessing(projectId: string): Promise<ProcessOrderResponse> {
    try {
      const requestBody: ProcessOrderRequest = {
        options: {
          auto_create_articles: true,
          generate_descriptions: true,
          stop_on_error: false
        }
      };

      const response = await fetch(`${this.baseUrl}/orders/${projectId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to start processing:', error);
      throw error;
    }
  }

  async checkJobStatus(jobId: string): Promise<Job> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to check job status:', error);
      throw error;
    }
  }

  async downloadResults(jobId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/download/excel`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `results_${jobId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download results:', error);
      throw error;
    }
  }

  async downloadProjectResults(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${projectId}/download`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `project_results_${projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download project results:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/orders/${projectId}`;
      console.log('Deleting project with URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Helper methods
  private mapOrderStatus(apiStatus: string): 'draft' | 'processing' | 'completed' {
    switch (apiStatus?.toLowerCase()) {
      case 'draft':
        return 'draft';
      case 'processing':
      case 'in_progress':
        return 'processing';
      case 'completed':
      case 'finished':
        return 'completed';
      default:
        return 'draft';
    }
  }

  private mapDocumentStatus(apiStatus: string): 'pending' | 'processing' | 'completed' | 'failed' {
    switch (apiStatus?.toLowerCase()) {
      case 'pending':
      case 'queued':
        return 'pending';
      case 'processing':
      case 'in_progress':
        return 'processing';
      case 'completed':
      case 'finished':
      case 'processed':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return 'Unknown';
    }
  }
}

export const apiService = new ApiService();