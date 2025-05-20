
import React, { useState, useEffect } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { PullRequestDetails, Comment } from '@/types/github';
import { fetchPullRequestDetails, fetchPullRequestComments, addReaction } from '@/services/githubService';
import { Smile, Frown, Heart, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const details = await fetchPullRequestDetails(owner, repo, prNumber);
        setPrDetails(details);
        
        const prComments = await fetchPullRequestComments(owner, repo, prNumber);
        setComments(prComments);
      } catch (err) {
        setError("Error loading pull request data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [owner, repo, prNumber]);

  const handleReaction = async (commentId: number, reactionType: string) => {
    try {
      await addReaction(owner, repo, commentId, reactionType);
      toast({
        title: "Reaction added",
        description: "Your reaction has been registered (simulated)",
      });
      
      // In a real app, we would refetch the comments to get updated reactions
      // For this demo, we'll just show the toast
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

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

  if (loading) {
    return <div className="text-center p-4">Loading pull request details...</div>;
  }

  if (error || !prDetails) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">{error || "Failed to load pull request details"}</p>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <Card className="p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{prDetails.title}</h1>
          {getStateBadge(prDetails.state)}
        </div>
        
        <div className="flex items-center mb-4">
          <Avatar className="h-8 w-8 mr-2">
            <img src={prDetails.user.avatar_url} alt={prDetails.user.login} />
          </Avatar>
          <div>
            <span className="font-medium">{prDetails.user.login}</span> opened this pull request {' '}
            {formatDistanceToNow(new Date(prDetails.created_at), { addSuffix: true })}
          </div>
        </div>
        
        <div className="prose max-w-none">
          {prDetails.body ? (
            <p className="whitespace-pre-line">{prDetails.body}</p>
          ) : (
            <p className="text-muted-foreground">No description provided</p>
          )}
        </div>
      </Card>

      <h2 className="text-xl font-bold mb-2 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" /> 
        Conversation
      </h2>
      
      {comments.length === 0 ? (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground">No comments yet</p>
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
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line">{comment.body}</p>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs" 
                      onClick={() => handleReaction(comment.id, 'thumbs_up')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {comment.reactions?.["+1"] || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleReaction(comment.id, 'thumbs_down')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {comment.reactions?.["-1"] || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleReaction(comment.id, 'smile')}
                    >
                      <Smile className="h-4 w-4 mr-1" />
                      {comment.reactions?.smile || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleReaction(comment.id, 'frown')}
                    >
                      <Frown className="h-4 w-4 mr-1" />
                      {comment.reactions?.frown || 0}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => handleReaction(comment.id, 'heart')}
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
