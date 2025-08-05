import { Config } from '../types';

export const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  authEnabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
  maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'jpg', 'png', 'jpeg']
};