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
import { AuthService } from './authService';

class ApiService {
  private baseUrl = config.apiUrl;


  private async getAuthHeaders(forceRefresh = false): Promise<Record<string, string>> {
    const token = forceRefresh 
      ? await AuthService.getAccessToken() 
      : AuthService.getCurrentAccessToken();
      
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // First attempt: use current token WITHOUT proactive refresh check
    const authHeaders = await this.getAuthHeaders(false);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    });

    // Handle 401 errors (token expired)
    if (response.status === 401) {
      try {
        // Try to refresh token
        await AuthService.refreshToken();

        // Retry with new token (force refresh check)
        const newAuthHeaders = await this.getAuthHeaders(true);
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...newAuthHeaders,
            ...options.headers,
          },
        });

        if (retryResponse.status === 401) {
          // Refresh failed - redirect to login
          AuthService.logout();
          throw new Error('Authentication failed');
        }

        return retryResponse;
      } catch (error) {
        // Refresh failed - redirect to login
        AuthService.logout();
        throw new Error('Authentication failed');
      }
    }

    // Handle 403 errors (insufficient permissions)
    if (response.status === 403) {
      throw new Error('Insufficient permissions');
    }

    return response;
  }

  async fetchProjects(): Promise<Project[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/orders`);
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

      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/orders`, {
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
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/orders/${projectId}`);
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

      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/orders/${projectId}/documents`, {
        method: 'POST',
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

      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/orders/${projectId}/process`, {
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
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/jobs/${jobId}`);
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
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/jobs/${jobId}/download/excel`);
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
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/orders/${projectId}/download`);
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

      const response = await this.makeAuthenticatedRequest(url, {
        method: 'DELETE',
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
  private mapOrderStatus(apiStatus: string): 'draft' | 'processing' | 'completed' | 'failed' {
    switch (apiStatus?.toLowerCase()) {
      case 'draft':
        return 'draft';
      case 'processing':
      case 'in_progress':
        return 'processing';
      case 'completed':
      case 'finished':
        return 'completed';
      case 'failed':
      case 'error':
        return 'failed';
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