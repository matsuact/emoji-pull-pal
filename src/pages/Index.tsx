
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import RepositoryInput from '@/components/RepositoryInput';
import PullRequestList from '@/components/PullRequestList';
import { fetchPullRequests } from '@/services/githubService';
import { SortOption } from '@/types/github';
import LoginButton from '@/components/LoginButton';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/components/SearchBar';
import { toast } from '@/components/ui/sonner';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [repository, setRepository] = useState<{ owner: string; name: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>("created-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const perPage = 10;

  // On mount, check if we have a stored repository
  useEffect(() => {
    const storedRepo = localStorage.getItem('current-repository');
    if (storedRepo) {
      setRepository(JSON.parse(storedRepo));
    }
  }, []);

  const { data, isLoading, error, isError } = useQuery({
    queryKey: repository ? ['pullRequests', repository.owner, repository.name, currentPage, perPage, sortOption, searchQuery] : null,
    queryFn: repository ? 
      () => fetchPullRequests(repository.owner, repository.name, currentPage, perPage, sortOption, searchQuery) : 
      () => Promise.resolve({pullRequests: [], totalCount: 0}),
    enabled: !!repository,
    retry: false
  });

  // Show error toast if there's an API error
  useEffect(() => {
    if (isError && error) {
      toast.error("エラーが発生しました", {
        description: `プルリクエストの取得に失敗しました: ${(error as Error).message}`,
      });
    }
  }, [isError, error]);

  const handleRepositorySubmit = (owner: string, repo: string) => {
    const newRepo = { owner, name: repo };
    setRepository(newRepo);
    setCurrentPage(1); // Reset to first page
    setSearchQuery(""); // Clear search query when changing repos
    
    // Store repository in localStorage for persistence
    localStorage.setItem('current-repository', JSON.stringify(newRepo));
  };

  const handleSelectPR = (prNumber: number) => {
    navigate(`/pr/${prNumber}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1); // Reset to first page when sort changes
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const openGitHubRepo = () => {
    if (repository) {
      window.open(`https://github.com/${repository.owner}/${repository.name}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">GitHub PR ビューア</h1>
          <LoginButton />
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center mb-6">
          <RepositoryInput onSubmit={handleRepositorySubmit} />
        </div>

        {repository && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">リポジトリ</h2>
            <button 
              onClick={openGitHubRepo}
              className="text-github-link hover:underline flex items-center"
              aria-label="GitHubでリポジトリを開く"
            >
              <span>{repository.owner}/{repository.name}</span>
              <ExternalLink className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}

        {repository && (
          <div className="mb-4">
            <SearchBar 
              onSearch={handleSearch} 
              initialQuery={searchQuery}
              placeholder="プルリクエストをタイトルで検索..."
            />
          </div>
        )}

        {!isAuthenticated && repository && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="flex items-center">
              <span className="font-medium">注意：</span>
              <span className="ml-2">
                リアクション追加などの機能を使用するには、GitHubでログインしてください
              </span>
            </p>
          </div>
        )}

        {isLoading && <div className="text-center p-4">プルリクエストを読み込み中...</div>}

        {isError && (
          <div className="text-center p-4 text-red-500">
            プルリクエストの読み込みエラー。リポジトリ名を確認してもう一度お試しください。
          </div>
        )}

        {!isLoading && !isError && repository && data && (
          <PullRequestList
            pullRequests={data.pullRequests}
            onSelectPR={handleSelectPR}
            totalCount={data.totalCount}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            sortOption={sortOption}
            perPage={perPage}
            repoOwner={repository.owner}
            repoName={repository.name}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
