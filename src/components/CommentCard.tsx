
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Comment } from '@/types/github';
import ReactionButtons from './ReactionButtons';

interface CommentCardProps {
  comment: Comment;
  onReaction: (commentId: number, reactionType: string) => void;
  isAuthenticated: boolean;
}

const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  onReaction,
  isAuthenticated
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10">
          <img src={comment.user.avatar_url} alt={comment.user.login} />
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{comment.user.login}</h4>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ja })}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line">{comment.body}</p>
          
          <Separator className="my-3" />
          
          <ReactionButtons 
            reactions={comment.reactions}
            onReaction={(reactionType) => onReaction(comment.id, reactionType)}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </Card>
  );
};

export default CommentCard;
