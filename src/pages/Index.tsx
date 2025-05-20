
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import RepositoryInput from '@/components/RepositoryInput';
import PullRequestList from '@/components/PullRequestList';
import PullRequestDetail from '@/components/PullRequestDetail';
import { fetchPullRequests } from '@/services/githubService';
import { PullRequest } from '@/types/github';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [repository, setRepository] = useState<{ owner: string; name: string } | null>(null);
  const [selectedPR, setSelectedPR] = useState<number | null>(null);

  const { data: pullRequests, isLoading, error } = useQuery({
    queryKey: repository ? ['pullRequests', repository.owner, repository.name] : null,
    queryFn: repository ? () => fetchPullRequests(repository.owner, repository.name) : () => Promise.resolve([]),
    enabled: !!repository
  });

  const handleRepositorySubmit = (owner: string, repo: string) => {
    setRepository({ owner, name: repo });
    setSelectedPR(null); // Reset selected PR when changing repository
  };

  const handleSelectPR = (prNumber: number) => {
    setSelectedPR(prNumber);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 bg-card border-b">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">GitHub PR Viewer</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-col items-center mb-6">
          <RepositoryInput onSubmit={handleRepositorySubmit} />
        </div>

        {repository && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Repository</h2>
            <p className="text-github-link">
              {repository.owner}/{repository.name}
            </p>
          </div>
        )}

        {isLoading && <div className="text-center p-4">Loading pull requests...</div>}

        {error && (
          <div className="text-center p-4 text-red-500">
            Error loading pull requests. Please check the repository name and try again.
          </div>
        )}

        {!isLoading && !error && repository && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <PullRequestList
                pullRequests={pullRequests || []}
                onSelectPR={handleSelectPR}
                selectedPR={selectedPR || undefined}
              />
            </div>

            {selectedPR && repository && (
              <>
                <Separator orientation="vertical" className="hidden md:block" />
                <div className="w-full md:w-2/3">
                  <PullRequestDetail
                    owner={repository.owner}
                    repo={repository.name}
                    prNumber={selectedPR}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
