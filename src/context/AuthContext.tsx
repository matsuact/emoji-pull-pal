
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GithubUser } from '@/types/github';
import { supabase } from '@/integrations/supabase/client';
import { logout } from '@/services/authService';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: GithubUser | null;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
    toast.info('ログアウトしました');
  };

  const refreshUserData = async (userId: string) => {
    try {
      // Get user metadata from session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return null;
      
      // Create a GitHub user object from metadata
      const githubUser: GithubUser = {
        login: session.user.user_metadata.user_name || session.user.user_metadata.preferred_username,
        avatar_url: session.user.user_metadata.avatar_url,
        name: session.user.user_metadata.name
      };
      
      return githubUser;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(true);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            setIsAuthenticated(true);
            // Defer data fetching with setTimeout to prevent potential deadlocks
            setTimeout(async () => {
              const userData = await refreshUserData(session.user.id);
              if (userData) {
                setUser(userData);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsAuthenticated(true);
          const userData = await refreshUserData(session.user.id);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
