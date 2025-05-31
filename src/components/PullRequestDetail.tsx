
import React, { useState, useEffect } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { PullRequestDetails, Comment } from '@/types/github';
import { fetchPullRequestDetails, fetchPullRequestComments, fetchPullRequestReactions, addReaction } from '@/services/githubService';
import { Smile, Frown, Heart, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/context/AuthContext';

interface PullRequestDetailProps {
  owner: string;
  repo: string;
  prNumber: number;
}

const PullRequestDetail: React.FC<PullRequestDetailProps> = ({
  owner,
  repo,
  prNumber
}) => {
  const [prDetails, setPrDetails] = useState<PullRequestDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prReactions, setPrReactions] = useState<any>({});
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchPullRequestDetails(owner, repo, prNumber);
        setPrDetails(details);
        
        const prComments = await fetchPullRequestComments(owner, repo, prNumber);
        setComments(prComments);
        
        // Fetch PR reactions
        const reactions = await fetchPullRequestReactions(owner, repo, prNumber);
        setPrReactions(reactions);
      } catch (err) {
        setError("プルリクエストデータの読み込み中にエラーが発生しました");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [owner, repo, prNumber]);

  const handlePRReaction = async (reactionType: string) => {
    if (!isAuthenticated) {
      toast("認証が必要です", {
        description: "リアクションを追加するにはGitHubにログインしてください",
      });
      return;
    }
    
    try {
      console.log(`PR Reaction Debug: ${reactionType} to ${owner}/${repo} PR#${prNumber}`);
      
      // Optimistic update
      setPrReactions(prevReactions => {
        const updatedReactions = { ...prevReactions };
        
        switch (reactionType) {
          case 'thumbs_up':
            updatedReactions["+1"] = (updatedReactions["+1"] || 0) + 1;
            break;
          case 'thumbs_down':
            updatedReactions["-1"] = (updatedReactions["-1"] || 0) + 1;
            break;
          case 'smile':
            updatedReactions.smile = (updatedReactions.smile || 0) + 1;
            break;
          case 'frown':
            updatedReactions.frown = (updatedReactions.frown || 0) + 1;
            break;
          case 'heart':
            updatedReactions.heart = (updatedReactions.heart || 0) + 1;
            break;
        }
        
        return updatedReactions;
      });
      
      // Add reaction to GitHub
      await addReaction(owner, repo, prNumber, reactionType, 'issue');
      
      // Fetch updated reactions from server
      const updatedReactions = await fetchPullRequestReactions(owner, repo, prNumber);
      setPrReactions(updatedReactions);
      
      toast("リアクション追加成功", {
        description: `プルリクエストに ${reactionType} リアクションを追加しました`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("PR Reaction Error:", errorMessage);
      
      // Revert optimistic update on error
      const revertedReactions = await fetchPullRequestReactions(owner, repo, prNumber);
      setPrReactions(revertedReactions);
      
      toast("リアクション追加エラー", {
        description: `エラー詳細: ${errorMessage}`,
        duration: 8000,
      });
    }
  };

  const handleReaction = async (commentId: number, reactionType: string) => {
    if (!isAuthenticated) {
      toast("認証が必要です", {
        description: "リアクションを追加するにはGitHubにログインしてください",
      });
      return;
    }
    
    try {
      console.log(`Comment Reaction Debug: ${reactionType} to comment ${commentId}`);
      
      // Optimistic update for comments
      setComments(comments.map(comment => {
        if (comment.id === commentId && comment.reactions) {
          const updatedReactions = { ...comment.reactions };
          
          switch (reactionType) {
            case 'thumbs_up':
              updatedReactions["+1"] = (updatedReactions["+1"] || 0) + 1;
              break;
            case 'thumbs_down':
              updatedReactions["-1"] = (updatedReactions["-1"] || 0) + 1;
              break;
            case 'smile':
              updatedReactions.smile = (updatedReactions.smile || 0) + 1;
              break;
            case 'frown':
              updatedReactions.frown = (updatedReactions.frown || 0) + 1;
              break;
            case 'heart':
              updatedReactions.heart = (updatedReactions.heart || 0) + 1;
              break;
          }
          
          return { ...comment, reactions: updatedReactions };
        }
        return comment;
      }));
      
      await addReaction(owner, repo, commentId, reactionType);
      
      // Fetch updated comments from server
      const updatedComments = await fetchPullRequestComments(owner, repo, prNumber);
      setComments(updatedComments);
      
      toast("リアクション追加成功", {
        description: `コメントに ${reactionType} リアクションを追加しました`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Comment Reaction Error:", errorMessage);
      
      // Revert optimistic update on error
      const revertedComments = await fetchPullRequestComments(owner, repo, prNumber);
      setComments(revertedComments);
      
      toast("リアクション追加エラー", {
        description: `エラー詳細: ${errorMessage}`,
        duration: 8000,
      });
    }
  };

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

  if (loading) {
    return <div className="text-center p-4">プルリクエストの詳細を読み込み中...</div>;
  }

  if (error || !prDetails) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">{error || "プルリクエストの詳細の読み込みに失敗しました"}</p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
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
        
        {/* プルリクエスト本体のリアクションボタン */}
        <div className="flex flex-wrap gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePRReaction('thumbs_up')}
            disabled={!isAuthenticated}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {prReactions["+1"] || 0}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePRReaction('thumbs_down')}
            disabled={!isAuthenticated}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {prReactions["-1"] || 0}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePRReaction('smile')}
            disabled={!isAuthenticated}
          >
            <Smile className="h-4 w-4 mr-1" />
            {prReactions.smile || 0}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePRReaction('frown')}
            disabled={!isAuthenticated}
          >
            <Frown className="h-4 w-4 mr-1" />
            {prReactions.frown || 0}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePRReaction('heart')}
            disabled={!isAuthenticated}
          >
            <Heart className="h-4 w-4 mr-1" />
            {prReactions.heart || 0}
          </Button>
        </div>
      </Card>

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
            <Card key={comment.id} className="p-4">
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
                  
                  <div className="flex flex-wrap gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleReaction(comment.id, 'thumbs_up')}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {comment.reactions?.["+1"] || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleReaction(comment.id, 'thumbs_down')}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {comment.reactions?.["-1"] || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleReaction(comment.id, 'smile')}
                      disabled={!isAuthenticated}
                    >
                      <Smile className="h-4 w-4 mr-1" />
                      {comment.reactions?.smile || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleReaction(comment.id, 'frown')}
                      disabled={!isAuthenticated}
                    >
                      <Frown className="h-4 w-4 mr-1" />
                      {comment.reactions?.frown || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-xs ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleReaction(comment.id, 'heart')}
                      disabled={!isAuthenticated}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {comment.reactions?.heart || 0}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PullRequestDetail;
