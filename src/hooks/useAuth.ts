import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';

const AUTH_STORAGE_KEY = 'invoice_processor_auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state from localStorage
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (error) {
        console.error('Failed to parse stored auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    return {
      isAuthenticated: false,
      user: undefined
    };
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulated login - replace with actual API call
      if (email && password) {
        const user: User = { id: '1', email };
        const newAuthState = { isAuthenticated: true, user };
        
        setAuthState(newAuthState);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    const newAuthState = { isAuthenticated: false, user: undefined };
    setAuthState(newAuthState);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    ...authState,
    login,
    logout
  };
}