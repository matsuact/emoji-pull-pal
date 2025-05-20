
import React from 'react';
import { PullRequest } from '@/types/github';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PullRequestListProps {
  pullRequests: PullRequest[];
  onSelectPR: (prNumber: number) => void;
  selectedPR?: number;
}

const PullRequestList: React.FC<PullRequestListProps> = ({
  pullRequests,
  onSelectPR,
  selectedPR
}) => {
  const getStateBadge = (state: string) => {
    switch (state) {
      case 'open':
        return <Badge className="bg-github-open">Open</Badge>;
      case 'merged':
        return <Badge className="bg-github-merged">Merged</Badge>;
      case 'closed':
        return <Badge className="bg-github-closed">Closed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-2">Pull Requests</h2>
      {pullRequests.length === 0 ? (
        <Card className="p-4 text-center">No pull requests found</Card>
      ) : (
        pullRequests.map((pr) => (
          <Card 
            key={pr.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
              selectedPR === pr.number ? 'border-2 border-github-link' : ''
            }`}
            onClick={() => onSelectPR(pr.number)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{pr.title}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  #{pr.number} opened {formatDistanceToNow(new Date(pr.created_at), { addSuffix: true })} by {pr.user.login}
                </div>
              </div>
              <div>
                {getStateBadge(pr.state)}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default PullRequestList;
