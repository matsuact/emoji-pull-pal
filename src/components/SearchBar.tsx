
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  initialQuery = '', 
  placeholder = 'タイトルで検索...' 
}) => {
  const [query, setQuery] = useState(initialQuery);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <div className="relative flex-grow">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <Button type="submit" className="bg-github-button hover:bg-github-buttonHover">
        検索
      </Button>
    </form>
  );
};

export default SearchBar;
