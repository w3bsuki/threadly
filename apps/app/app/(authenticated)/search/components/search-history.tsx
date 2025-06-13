'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Clock, X, TrendingUp, Search, Loader2 } from 'lucide-react';
import { toast } from '@/components/toast';

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

export function SearchHistory({ onSearchSelect, currentQuery }: SearchHistoryProps) {
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
    'accessories'
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
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Searches
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearHistory}
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => onSearchSelect(item.query)}
              >
                <Search className="h-3 w-3 mr-1" />
                {item.query}
                {item.resultCount > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
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
        <h3 className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Popular Searches
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <Button
              key={search}
              variant="secondary"
              size="sm"
              className="h-8"
              onClick={() => onSearchSelect(search)}
            >
              {search}
            </Button>
          ))}
        </div>
      </div>

      {/* No History State */}
      {history.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recent searches</p>
          <p>Your search history will appear here</p>
        </div>
      )}
    </div>
  );
}