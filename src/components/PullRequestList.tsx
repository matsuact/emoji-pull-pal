
import React, { useState } from 'react';
import { PullRequest, SortOption } from '@/types/github';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, SortDesc } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PullRequestListProps {
  pullRequests: PullRequest[];
  onSelectPR?: (prNumber: number) => void;
  selectedPR?: number;
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSortChange: (sortOption: SortOption) => void;
  sortOption: SortOption;
  perPage: number;
}

const PullRequestList: React.FC<PullRequestListProps> = ({
  pullRequests,
  onSelectPR,
  selectedPR,
  totalCount,
  currentPage,
  onPageChange,
  onSortChange,
  sortOption,
  perPage
}) => {
  const navigate = useNavigate();
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

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

  const handlePRClick = (prNumber: number) => {
    if (onSelectPR) {
      // Use callback if provided (for the old view)
      onSelectPR(prNumber);
    } else {
      // Navigate to PR detail page
      navigate(`/pr/${prNumber}`);
    }
  };

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Pull Requests</h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileSortOpen(!isMobileSortOpen)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Sort
          </Button>
          
          <div className={`${isMobileSortOpen ? 'block' : 'hidden'} md:block`}>
            <Select
              value={sortOption}
              onValueChange={(value) => onSortChange(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4 rotate-180" />
                    Oldest
                  </div>
                </SelectItem>
                <SelectItem value="most-comments">Most comments</SelectItem>
                <SelectItem value="least-comments">Least comments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {pullRequests.length === 0 ? (
        <Card className="p-4 text-center">No pull requests found</Card>
      ) : (
        <div className="space-y-2">
          {pullRequests.map((pr) => (
            <Card 
              key={pr.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                selectedPR === pr.number ? 'border-2 border-github-link' : ''
              }`}
              onClick={() => handlePRClick(pr.number)}
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
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              {/* Fix: Don't use 'as' prop with Button, use PaginationLink directly */}
              <PaginationLink
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              >
                <span className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </span>
              </PaginationLink>
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pagination around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === currentPage}
                    onClick={() => onPageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              {/* Fix: Don't use 'as' prop with Button, use PaginationLink directly */}
              <PaginationLink
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              >
                <span className="flex items-center">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PullRequestList;
