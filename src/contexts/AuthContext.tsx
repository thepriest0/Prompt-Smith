import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check auth status

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('🔍 Frontend auth check - API URL:', apiUrl);
      console.log('🔍 Frontend auth check - Full URL:', `${apiUrl}/api/auth/me`);
      console.log('🔍 Frontend auth check - Current cookies:', document.cookie);
      
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: 'include' // Include cookies for session
      });
      
      console.log('🔍 Frontend auth check - Response status:', response.status);
      console.log('🔍 Frontend auth check - Response headers:', [...response.headers.entries()]);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Frontend auth check - User authenticated:', data.user);
        setUser(data.user);
      } else {
        console.log('❌ Frontend auth check - Not authenticated, status:', response.status);
      }
    } catch (error) {
      console.log('❌ Frontend auth check - Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, logout, checkAuthStatus, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};