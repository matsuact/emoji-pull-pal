
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '@/services/authService';
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('認証処理中...');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        setIsProcessing(true);
        
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          const errorDescription = urlParams.get('error_description') || 'Unknown error';
          setError(`GitHub認証エラー: ${errorDescription}`);
          setStatus('認証が拒否されました');
          toast.error('GitHub認証に失敗しました');
          setIsProcessing(false);
          return;
        }
        
        if (!code) {
          setError('認証コードが提供されていません');
          setStatus('エラー: 認証コードがありません');
          toast.error('認証に失敗しました: コードがありません');
          setIsProcessing(false);
          return;
        }

        // Process the authorization code
        setStatus('GitHubと通信中...');
        const success = await handleAuthCallback(code);
        
        if (success) {
          setStatus('認証成功！リダイレクト中...');
          toast.success('GitHubへのログインに成功しました');
          setTimeout(() => navigate('/'), 1000);
        } else {
          setError('アクセストークンの取得に失敗しました');
          setStatus('認証に失敗しました');
          toast.error('GitHubへの認証に失敗しました');
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
