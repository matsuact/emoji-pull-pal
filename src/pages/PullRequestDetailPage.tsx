
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PullRequestDetail from '@/components/PullRequestDetail';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';

const PullRequestDetailPage: React.FC = () => {
  const { prNumber } = useParams<{ prNumber: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [repository, setRepository] = useState<{owner: string; name: string} | null>(null);
  
  useEffect(() => {
    // Retrieve repository from localStorage
    const storedRepo = localStorage.getItem('current-repository');
    if (storedRepo) {
      setRepository(JSON.parse(storedRepo));
    } else {
      // If no repository is stored, redirect to home
      navigate('/');
    }
  }, [navigate]);
  
  const goBack = () => {
    navigate('/');
  };
  
  if (!repository || !prNumber) {
    return <div className="p-8 text-center">読み込み中...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={goBack} 
          className="mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> プルリクエスト一覧に戻る
        </Button>
        
        <h2 className="text-lg font-semibold mb-1">リポジトリ</h2>
        <p className="text-github-link">
          {repository.owner}/{repository.name}
        </p>
        
        <Separator className="my-4" />
      </div>
      
      {!isAuthenticated && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="flex items-center">
            <span className="font-medium">注意：</span>
            <span className="ml-2">
              コメントにリアクションを追加するには、GitHubでログインしてください
            </span>
          </p>
        </div>
      )}
      
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              リポジトリ情報
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-1">リポジトリ</h2>
              <p className="text-github-link">
                {repository.owner}/{repository.name}
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <PullRequestDetail 
        owner={repository.owner} 
        repo={repository.name} 
        prNumber={parseInt(prNumber, 10)} 
      />
    </div>
  );
};

export default PullRequestDetailPage;
