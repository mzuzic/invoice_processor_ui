export interface Project {
  id: string;
  reference: string;
  status: 'draft' | 'processing' | 'completed';
  documentCount: number;
  created: string;
  documents?: Document[];
  notes?: string;
}

export interface Document {
  id: string;
  filename: string;
  document_type: string;
  vendor?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  job_id?: string;
}

export interface Job {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: {
    vendor: string;
    items_extracted: number;
    total_amount: number;
    new_articles_created: number;
  };
}

export interface CreateOrderRequest {
  reference: string;
  notes?: string;
}

export interface CreateOrderResponse {
  id: string;
  reference: string;
  status: string;
}

export interface UploadDocumentsResponse {
  order_id: string;
  documents_added: Document[];
}

export interface ProcessOrderRequest {
  options: {
    auto_create_articles: boolean;
    generate_descriptions: boolean;
    stop_on_error: boolean;
  };
}

export interface ProcessOrderResponse {
  order_id: string;
  batch_id: string;
  jobs: Array<{
    document_id: string;
    job_id: string;
    status: string;
  }>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
}

export interface Config {
  apiUrl: string;
  authEnabled: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
}

export type ProjectStatus = Project['status'];
export type DocumentStatus = Document['status'];