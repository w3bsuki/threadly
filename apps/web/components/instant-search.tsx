'use client';

import { Button } from '@repo/ui/components';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface InstantSearchProps {
  placeholder?: string;
  className?: string;
}

export function InstantSearch({
  placeholder = 'Search products...',
  className = '',
}: InstantSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useCallback(
    (term: string) => {
      const timeoutId = setTimeout(() => {
        setIsSearching(true);
        const params = new URLSearchParams(searchParams);

        if (term) {
          params.set('q', term);
        } else {
          params.delete('q');
        }

        // Reset page when searching
        params.delete('page');

        router.push(`/products?${params.toString()}`);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [searchParams, router]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(searchTerm);
    return cleanup;
  }, [searchTerm, debouncedSearch]);

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full rounded-[var(--radius-lg)] border border-border bg-background py-2 pr-10 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          type="text"
          value={searchTerm}
        />
        {searchTerm && (
          <Button
            className="-translate-y-1/2 absolute top-1/2 right-1 h-6 w-6 p-0 text-muted-foreground hover:text-muted-foreground"
            onClick={handleClear}
            size="sm"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isSearching && (
        <div className="-translate-y-1/2 absolute top-1/2 right-3">
          <div className="h-4 w-4 animate-spin rounded-[var(--radius-full)] border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
