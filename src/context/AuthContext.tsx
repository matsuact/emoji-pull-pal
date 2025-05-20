
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GithubUser } from '@/types/github';
import { getToken, getUser, logout } from '@/services/authService';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: GithubUser | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        if (token) {
          const userData = getUser();
          if (userData) {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            // Token exists but no user data, logout
            handleLogout();
            toast.error('セッションが無効になりました。再度ログインしてください。');
          }
        }
      } catch (error) {
        console.error('認証状態の確認中にエラー：', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    toast.info('ログアウトしました');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      logout: handleLogout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthはAuthProviderの中で使用する必要があります');
  }
  return context;
};
