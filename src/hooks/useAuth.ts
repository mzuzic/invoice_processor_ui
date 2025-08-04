import { useState } from 'react';
import { AuthState, User } from '../types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: undefined
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulated login - replace with actual API call
      if (email && password) {
        const user: User = { id: '1', email };
        setAuthState({ isAuthenticated: true, user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: undefined });
  };

  return {
    ...authState,
    login,
    logout
  };
}