
import React from 'react';
import { Button } from "@/components/ui/button";
import { Smile, Frown, Heart, ThumbsUp, ThumbsDown, PartyPopper, Rocket, Eye } from "lucide-react";

interface ReactionButtonsProps {
  reactions: any;
  onReaction: (reactionType: string) => void;
  isAuthenticated: boolean;
}

const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  reactions,
  onReaction,
  isAuthenticated
}) => {
  const reactionButtons = [
    {
      type: 'thumbs_up',
      icon: ThumbsUp,
      count: reactions["+1"] || 0,
      colorClass: reactions["+1"] > 0 ? "bg-yellow-100 hover:bg-yellow-200 border-yellow-300" : "bg-white",
      iconColorClass: reactions["+1"] > 0 ? "text-yellow-500" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'thumbs_down',
      icon: ThumbsDown,
      count: reactions["-1"] || 0,
      colorClass: reactions["-1"] > 0 ? "bg-gray-100 hover:bg-gray-200 border-gray-300" : "bg-white",
      iconColorClass: reactions["-1"] > 0 ? "text-gray-500" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'smile',
      icon: Smile,
      count: reactions.laugh || 0,
      colorClass: reactions.laugh > 0 ? "bg-yellow-50 hover:bg-yellow-100 border-yellow-200" : "bg-white",
      iconColorClass: reactions.laugh > 0 ? "text-yellow-400" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'frown',
      icon: Frown,
      count: reactions.confused || 0,
      colorClass: reactions.confused > 0 ? "bg-gray-50 hover:bg-gray-100 border-gray-200" : "bg-white",
      iconColorClass: reactions.confused > 0 ? "text-gray-400" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'heart',
      icon: Heart,
      count: reactions.heart || 0,
      colorClass: reactions.heart > 0 ? "bg-red-100 hover:bg-red-200 border-red-300" : "bg-white",
      iconColorClass: reactions.heart > 0 ? "text-red-500" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'hooray',
      icon: PartyPopper,
      count: reactions.hooray || 0,
      colorClass: reactions.hooray > 0 ? "bg-orange-100 hover:bg-orange-200 border-orange-300" : "bg-white",
      iconColorClass: reactions.hooray > 0 ? "text-orange-400" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'rocket',
      icon: Rocket,
      count: reactions.rocket || 0,
      colorClass: reactions.rocket > 0 ? "bg-blue-100 hover:bg-blue-200 border-blue-300" : "bg-white",
      iconColorClass: reactions.rocket > 0 ? "text-blue-500" : "text-muted-foreground filter grayscale"
    },
    {
      type: 'eyes',
      icon: Eye,
      count: reactions.eyes || 0,
      colorClass: reactions.eyes > 0 ? "bg-green-100 hover:bg-green-200 border-green-300" : "bg-white",
      iconColorClass: reactions.eyes > 0 ? "text-green-500" : "text-muted-foreground filter grayscale"
    }
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {reactionButtons.map(({ type, icon: Icon, count, colorClass, iconColorClass }) => (
        <Button 
          key={type}
          size="sm" 
          variant="outline" 
          className={`text-xs ${colorClass} ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onReaction(type)}
          disabled={!isAuthenticated}
        >
          <Icon className={`h-4 w-4 mr-1 ${iconColorClass}`} />
          {count}
        </Button>
      ))}
    </div>
  );
};

export default ReactionButtons;
