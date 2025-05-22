import React, { useState } from 'react';
import { PullRequest, SortOption } from '@/types/github';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  SortDesc, 
  MessageSquare, 
  Search,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";
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
        return <Badge className="bg-github-open">オープン</Badge>;
      case 'merged':
        return <Badge className="bg-github-merged">マージ済み</Badge>;
      case 'closed':
        return <Badge className="bg-github-closed">クローズ</Badge>;
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

  // Sort option display names for better readability
  const sortOptionLabels: Record<SortOption, string> = {
    "created-desc": "作成日（新しい順）",
    "created-asc": "作成日（古い順）",
    "updated-desc": "更新日（新しい順）",
    "updated-asc": "更新日（古い順）",
    "created_at-desc": "作成日時（新しい順）",
    "created_at-asc": "作成日時（古い順）"
  };

  // Icons for each sort direction
  const getSortDirectionIcon = (sortOption: SortOption) => {
    return sortOption.endsWith('-asc') ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4 w-full mx-auto max-w-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-xl font-bold">プルリクエスト {totalCount > 0 && <span className="text-sm font-normal">（全{totalCount}件）</span>}</h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileSortOpen(!isMobileSortOpen)}
          >
            <Filter className="h-4 w-4 mr-1" />
            並び替え
          </Button>
          
          <div className={`${isMobileSortOpen ? 'block' : 'hidden'} md:block`}>
            <Select
              value={sortOption}
              onValueChange={(value) => onSortChange(value as SortOption)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created-desc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ArrowDown className="h-4 w-4" />
                    作成日（新しい順）
                  </div>
                </SelectItem>
                <SelectItem value="created-asc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ArrowUp className="h-4 w-4" />
                    作成日（古い順）
                  </div>
                </SelectItem>
                <SelectItem value="updated-desc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ArrowDown className="h-4 w-4" />
                    更新日（新しい順）
                  </div>
                </SelectItem>
                <SelectItem value="updated-asc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ArrowUp className="h-4 w-4" />
                    更新日（古い順）
                  </div>
                </SelectItem>
                <SelectItem value="created_at-desc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ArrowDown className="h-4 w-4" />
                    作成日時（新しい順）
                  </div>
                </SelectItem>
                <SelectItem value="created_at-asc">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <ArrowUp className="h-4 w-4" />
                    作成日時（古い順）
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {pullRequests.length === 0 ? (
        <Card className="p-4">
          <div className="text-center flex flex-col items-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">プルリクエストが見つかりません</h3>
            <p className="text-muted-foreground">
              検索条件を変更するか、別のリポジトリを試してください
            </p>
          </div>
        </Card>
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
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span>#{pr.number}</span>
                    <span>{formatDistanceToNow(new Date(pr.created_at), { addSuffix: true, locale: ja })}に{pr.user.login}が作成</span>
                    {pr.comments !== undefined && pr.comments > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {pr.comments}
                      </span>
                    )}
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
              <PaginationLink
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              >
                <span className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  前へ
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
              <PaginationLink
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              >
                <span className="flex items-center">
                  次へ
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
