
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GithubUser } from '@/types/github';
import { getToken, getUser, logout } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: GithubUser | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUser | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
