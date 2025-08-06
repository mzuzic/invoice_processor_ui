import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User, LoginRequest } from '../types/auth';
import { AuthService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = () => {
      const auth = AuthService.getAuth();
      if (auth && AuthService.isAuthenticated()) {
        setUser(auth.user);
        // Start background refresh for existing session
        AuthService.startBackgroundRefresh();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const authData = await AuthService.login(credentials);
      setUser(authData.user);
      // Start background refresh timer after successful login
      AuthService.startBackgroundRefresh();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout(); // This will handle stopping timer and clearing auth
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};