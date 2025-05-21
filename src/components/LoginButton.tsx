
import React from 'react';
import { Button } from "@/components/ui/button";
import { loginWithGithub } from '@/services/authService';
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const LoginButton: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleClick = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      await loginWithGithub();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated && user && (
        <div className="flex items-center mr-2">
          <Avatar className="h-7 w-7 mr-2">
            <AvatarImage src={user.avatar_url} alt={user.login} />
          </Avatar>
          <span className="text-sm hidden md:inline">{user.login}</span>
        </div>
      )}
      <Button 
        onClick={handleClick} 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
      >
        {isAuthenticated ? (
          <>
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">ログアウト</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>GitHubでログイン</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default LoginButton;
