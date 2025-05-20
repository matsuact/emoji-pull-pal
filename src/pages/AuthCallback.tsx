
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '@/services/authService';
import { toast } from "@/components/ui/sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus('Error: No authorization code received');
          toast.error('Authentication failed: No code provided');
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        // Process the authorization code
        const success = await handleAuthCallback(code);
        
        if (success) {
          setStatus('Authentication successful! Redirecting...');
          toast.success('Successfully logged in to GitHub');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setStatus('Authentication failed. Redirecting to home...');
          toast.error('Failed to authenticate with GitHub');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setStatus('Authentication error. Redirecting to home...');
        toast.error('Authentication error occurred');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">GitHub Authentication</h1>
        <div className="animate-pulse">{status}</div>
      </div>
    </div>
  );
};

export default AuthCallback;
