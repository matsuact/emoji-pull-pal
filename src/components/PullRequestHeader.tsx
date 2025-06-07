
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { PullRequestDetails } from '@/types/github';
import ReactionButtons from './ReactionButtons';

interface PullRequestHeaderProps {
  prDetails: PullRequestDetails;
  prReactions: any;
  onPRReaction: (reactionType: string) => void;
  isAuthenticated: boolean;
}

const PullRequestHeader: React.FC<PullRequestHeaderProps> = ({
  prDetails,
  prReactions,
  onPRReaction,
  isAuthenticated
}) => {
  const getStateBadge = (state: string) => {
    switch (state) {
      case 'open':
        return <Badge className="bg-github-open">オープン</Badge>;
      case 'merged':
        return <Badge className="bg-github-merged">マージ済み</Badge>;
      case 'closed':
        return <Badge className="bg-github-closed">クローズ</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold break-words">{prDetails.title}</h1>
        {getStateBadge(prDetails.state)}
      </div>
      
      <div className="flex items-center mb-4">
        <Avatar className="h-8 w-8 mr-2">
          <img src={prDetails.user.avatar_url} alt={prDetails.user.login} />
        </Avatar>
        <div>
          <span className="font-medium">{prDetails.user.login}</span>さんが{' '}
          {formatDistanceToNow(new Date(prDetails.created_at), { addSuffix: true, locale: ja })}にオープン
        </div>
      </div>
      
      <div className="prose max-w-none mb-4">
        {prDetails.body ? (
          <p className="whitespace-pre-line">{prDetails.body}</p>
        ) : (
          <p className="text-muted-foreground">説明はありません</p>
        )}
      </div>

      <Separator className="my-4" />
      
      <ReactionButtons 
        reactions={prReactions}
        onReaction={onPRReaction}
        isAuthenticated={isAuthenticated}
      />
    </Card>
  );
};

export default PullRequestHeader;
