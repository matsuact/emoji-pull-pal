
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('認証処理中...');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        setIsProcessing(true);
        
        // Check if there was an error in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorParam) {
          console.error("OAuth error:", errorParam, errorDescription);
          setError(`GitHub認証エラー: ${errorDescription || 'Unknown error'}`);
          setStatus('認証が拒否されました');
          toast.error('GitHub認証に失敗しました');
          setIsProcessing(false);
          return;
        }
        
        // Check if we have auth data in the fragment
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log("Found auth data in URL hash, Supabase will handle this automatically");
        }
        
        // With Supabase, the session should already be established if auth was successful
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(`セッションエラー: ${sessionError.message}`);
          setStatus('認証に失敗しました');
          toast.error('認証エラーが発生しました');
          setIsProcessing(false);
          return;
        }
        
        if (session) {
          console.log("Authentication successful, session established");
          setStatus('認証成功！リダイレクト中...');
          toast.success('GitHubへのログインに成功しました');
          setTimeout(() => navigate('/'), 1000);
        } else {
          // If we don't have a session but no explicit error either, something went wrong
          console.error("No session found after authentication");
          setError('認証中にエラーが発生しました: セッションが確立できませんでした');
          setStatus('認証に失敗しました');
          toast.error('GitHub認証に失敗しました');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setError(`予期せぬエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
        setStatus('認証エラー');
        toast.error('認証エラーが発生しました');
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [navigate]);

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen w-full items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold mb-4">GitHub認証</h1>
        
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-lg">{status}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>認証エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleRetry} className="w-full">
              ホームページに戻る
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
