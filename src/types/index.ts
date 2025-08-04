export interface Project {
  id: string;
  reference: string;
  status: 'draft' | 'processing' | 'completed';
  documentCount: number;
  created: string;
  documents?: Document[];
}

export interface Document {
  id: string;
  filename: string;
  type: string;
  vendor?: string;
  status: 'queued' | 'processing' | 'processed' | 'failed';
  jobId: string;
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