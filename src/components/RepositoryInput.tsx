
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface RepositoryInputProps {
  onSubmit: (owner: string, repo: string) => void;
}

const RepositoryInput: React.FC<RepositoryInputProps> = ({ onSubmit }) => {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Handle different GitHub URL formats
      let owner, repo;
      
      // Check if it's a full URL
      if (repoUrl.includes('github.com')) {
        const urlParts = repoUrl.split('github.com/')[1]?.split('/');
        if (urlParts && urlParts.length >= 2) {
          owner = urlParts[0];
          repo = urlParts[1];
        }
      } else {
        // Check if it's in the format "owner/repo"
        const parts = repoUrl.trim().split('/');
        if (parts.length === 2) {
          owner = parts[0];
          repo = parts[1];
        }
      }
      
      if (!owner || !repo) {
        toast.error("無効なリポジトリ形式です。owner/repo形式またはGitHub URLを使用してください");
        return;
      }
      
      onSubmit(owner, repo);
    } catch (error) {
      toast.error("リポジトリ入力の解析エラー");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4 w-full max-w-2xl">
      <Input
        type="text"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="GitHubリポジトリを入力（例：owner/repo または完全なURL）"
        className="flex-grow"
      />
      <Button type="submit" className="bg-github-button hover:bg-github-buttonHover">
        プルリクエストを読み込む
      </Button>
    </form>
  );
};

export default RepositoryInput;
