
import React from 'react';
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Comment } from '@/types/github';
import CommentCard from './CommentCard';

interface CommentsListProps {
  comments: Comment[];
  prNumber: number;
  isAuthenticated: boolean;
  onReaction: (commentId: number, reactionType: string) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  prNumber,
  isAuthenticated,
  onReaction
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-2 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" /> 
        会話
      </h2>
      
      {/* デバッグ情報 */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-600">
        認証状態: {isAuthenticated ? 'ログイン済み' : '未ログイン'} | コメント数: {comments.length} | PR番号: {prNumber}
      </div>
      
      {comments.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">コメントはまだありません</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReaction={onReaction}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CommentsList;
