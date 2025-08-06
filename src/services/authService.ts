import { AuthTokens, LoginRequest } from '../types/auth';
import { config } from '../config';

export class AuthService {
  private static readonly STORAGE_KEY = 'invoice_auth';
  private static readonly API_BASE = config.apiUrl;

  // Store auth data
  static setAuth(authData: AuthTokens): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
  }

  // Get stored auth data
  static getAuth(): AuthTokens | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  // Clear auth data
  static clearAuth(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if user is logged in
  static isAuthenticated(): boolean {
    const auth = this.getAuth();
    if (!auth) return false;

    const refreshExpiry = new Date(auth.refresh_expires_at);
    return refreshExpiry > new Date();
  }

  // Check if access token needs refresh
  static needsRefresh(): boolean {
    const auth = this.getAuth();
    if (!auth) return false;

    const accessExpiry = new Date(auth.expires_at);
    const now = new Date();
    
    // Refresh if token expires in next 5 minutes
    return accessExpiry.getTime() - now.getTime() < 5 * 60 * 1000;
  }

  // Login
  static async login(credentials: LoginRequest): Promise<AuthTokens> {
    const response = await fetch(`${this.API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const authData: AuthTokens = await response.json();
    this.setAuth(authData);
    return authData;
  }

  // Refresh tokens
  static async refreshToken(): Promise<AuthTokens> {
    const auth = this.getAuth();
    if (!auth) throw new Error('No refresh token available');

    const response = await fetch(`${this.API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: auth.refresh_token }),
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error('Token refresh failed');
    }

    const newAuthData: AuthTokens = await response.json();
    this.setAuth(newAuthData);
    return newAuthData;
  }

  // Get current access token (with automatic refresh)
  static async getAccessToken(): Promise<string | null> {
    if (!this.isAuthenticated()) return null;

    if (this.needsRefresh()) {
      try {
        await this.refreshToken();
      } catch (error) {
        this.clearAuth();
        return null;
      }
    }

    const auth = this.getAuth();
    return auth?.access_token || null;
  }

  // Logout
  static logout(): void {
    this.clearAuth();
    window.location.href = '/login';
  }
}