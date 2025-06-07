
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { PullRequestDetails, Comment } from '@/types/github';
import { fetchPullRequestDetails, fetchPullRequestComments, fetchPullRequestReactions, addReaction } from '@/services/githubService';
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/context/AuthContext';
import PullRequestHeader from './PullRequestHeader';
import CommentsList from './CommentsList';

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
            updatedReactions.laugh = (updatedReactions.laugh || 0) + 1;
            break;
          case 'frown':
            updatedReactions.confused = (updatedReactions.confused || 0) + 1;
            break;
          case 'heart':
            updatedReactions.heart = (updatedReactions.heart || 0) + 1;
            break;
          case 'hooray':
            updatedReactions.hooray = (updatedReactions.hooray || 0) + 1;
            break;
          case 'rocket':
            updatedReactions.rocket = (updatedReactions.rocket || 0) + 1;
            break;
          case 'eyes':
            updatedReactions.eyes = (updatedReactions.eyes || 0) + 1;
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
              updatedReactions.laugh = (updatedReactions.laugh || 0) + 1;
              break;
            case 'frown':
              updatedReactions.confused = (updatedReactions.confused || 0) + 1;
              break;
            case 'heart':
              updatedReactions.heart = (updatedReactions.heart || 0) + 1;
              break;
            case 'hooray':
              updatedReactions.hooray = (updatedReactions.hooray || 0) + 1;
              break;
            case 'rocket':
              updatedReactions.rocket = (updatedReactions.rocket || 0) + 1;
              break;
            case 'eyes':
              updatedReactions.eyes = (updatedReactions.eyes || 0) + 1;
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
      <PullRequestHeader 
        prDetails={prDetails}
        prReactions={prReactions}
        onPRReaction={handlePRReaction}
        isAuthenticated={isAuthenticated}
      />

      <CommentsList 
        comments={comments}
        prNumber={prNumber}
        isAuthenticated={isAuthenticated}
        onReaction={handleReaction}
      />
    </div>
  );
};

export default PullRequestDetail;
