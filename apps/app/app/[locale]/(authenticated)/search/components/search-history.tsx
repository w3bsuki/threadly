'use client';

import { Button, toast } from '@repo/ui/components';
import { Clock, Loader2, Search, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: string;
  resultCount: number;
}

interface SearchHistoryProps {
  onSearchSelect: (query: string) => void;
  currentQuery?: string;
}

export function SearchHistory({
  onSearchSelect,
  currentQuery,
}: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popularSearches] = useState([
    'designer dresses',
    'vintage jeans',
    'luxury handbags',
    'sneakers',
    'winter coats',
    'evening wear',
    'casual shirts',
    'accessories',
  ]);

  // Load search history from API
  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      if (!response.ok) throw new Error('Failed to fetch search history');

      const data = await response.json();
      setHistory(data.searchHistory);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/search-history', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear history');

      setHistory([]);
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear search history');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recent Searches */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-medium text-sm">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h3>
            <Button onClick={clearHistory} size="sm" variant="ghost">
              Clear All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <Button
                className="h-8"
                key={item.id}
                onClick={() => onSearchSelect(item.query)}
                size="sm"
                variant="outline"
              >
                <Search className="mr-1 h-3 w-3" />
                {item.query}
                {item.resultCount > 0 && (
                  <span className="ml-1 text-muted-foreground text-xs">
                    ({item.resultCount})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <TrendingUp className="h-4 w-4" />
          Popular Searches
        </h3>

        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <Button
              className="h-8"
              key={search}
              onClick={() => onSearchSelect(search)}
              size="sm"
              variant="secondary"
            >
              {search}
            </Button>
          ))}
        </div>
      </div>

      {/* No History State */}
      {history.length === 0 && (
        <div className="py-4 text-center text-muted-foreground text-sm">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No recent searches</p>
          <p>Your search history will appear here</p>
        </div>
      )}
    </div>
  );
}
