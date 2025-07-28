'use client';

import { Button, Input } from '@repo/design-system/components';
import { Filter, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface UnifiedSearchProps {
  placeholder?: string;
  showCategoriesButton?: boolean;
  onCategoriesToggle?: () => void;
  categoriesExpanded?: boolean;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  className?: string;
}

export function UnifiedSearch({
  placeholder = 'Search for items, brands, or members',
  showCategoriesButton = true,
  onCategoriesToggle,
  categoriesExpanded = false,
  onSearch,
  autoFocus = false,
  className = '',
}: UnifiedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(searchQuery);
    }
  };

  return (
    <div className={`relative flex-1 ${className}`}>
      <div className="flex items-center overflow-hidden rounded-[var(--radius-lg)] bg-secondary">
        <div className="flex flex-1 items-center px-4">
          <Search className="mr-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <input
            aria-label="Search products"
            className="w-full bg-transparent py-3 text-foreground placeholder-gray-500 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            ref={searchInputRef}
            type="text"
            value={searchQuery}
          />
        </div>

        {showCategoriesButton && onCategoriesToggle && (
          <Button
            aria-controls="categories-menu"
            aria-expanded={categoriesExpanded}
            aria-label="Toggle categories menu"
            className={`h-full w-10 rounded-none border-border border-l transition-all hover:bg-accent ${
              categoriesExpanded ? 'bg-accent' : ''
            }`}
            onClick={onCategoriesToggle}
            size="icon"
            variant="ghost"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
}

export interface MobileSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function MobileSearch({
  placeholder = 'Search Threadly',
  onSearch,
  className = '',
}: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(searchQuery);
      setIsExpanded(false);
    }
  };

  const handleBlur = () => {
    if (!searchQuery) {
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        aria-label="Open search"
        className={`h-9 w-9 text-background hover:bg-background/10 ${className}`}
        onClick={() => setIsExpanded(true)}
        size="icon"
        variant="ghost"
      >
        <Search className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        aria-label="Search"
        className="w-full rounded-[var(--radius-lg)] bg-background/10 py-2 pr-4 pl-10 text-background placeholder-white/60 backdrop-blur-sm transition-all focus:bg-background/20 focus:outline-none focus:ring-2 focus:ring-white/20"
        onBlur={handleBlur}
        onChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        ref={searchInputRef}
        type="text"
        value={searchQuery}
      />
    </div>
  );
}
