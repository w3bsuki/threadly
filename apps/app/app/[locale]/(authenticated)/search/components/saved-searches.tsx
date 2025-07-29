'use client';

import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  toast,
} from '@repo/ui/components';
import {
  Bell,
  BellOff,
  Bookmark,
  Loader2,
  MoreVertical,
  Search,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SavedSearchDialog } from '@/components/saved-search-dialog';
import type { SearchFilters } from '@/lib/hooks/use-search';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedSearchesProps {
  currentQuery?: string;
  currentFilters?: SearchFilters;
  onApplySearch?: (query: string, filters: SearchFilters) => void;
}

export function SavedSearches({
  currentQuery = '',
  currentFilters,
  onApplySearch,
}: SavedSearchesProps) {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load saved searches from API
  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await fetch('/api/saved-searches');
      if (!response.ok) throw new Error('Failed to fetch saved searches');

      const data = await response.json();
      setSavedSearches(data.savedSearches);
    } catch (error) {
      toast.error('Failed to load saved searches');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSearch = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/saved-searches?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete search');

      setSavedSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success('Search deleted');
    } catch (error) {
      toast.error('Failed to delete search');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAlerts = async (id: string, currentEnabled: boolean) => {
    try {
      const response = await fetch(`/api/saved-searches/${id}/toggle-alerts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertEnabled: !currentEnabled }),
      });

      if (!response.ok) throw new Error('Failed to update alerts');

      setSavedSearches((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, alertEnabled: !currentEnabled } : s
        )
      );

      toast.success(currentEnabled ? 'Alerts disabled' : 'Alerts enabled');
    } catch (error) {
      toast.error('Failed to update alert settings');
    }
  };

  const applySearch = (search: SavedSearch) => {
    if (onApplySearch) {
      onApplySearch(search.query, search.filters || {});
    } else {
      // Navigate to search page with params
      const params = new URLSearchParams({ q: search.query });
      if (search.filters) {
        Object.entries(search.filters).forEach(([key, value]) => {
          if (value) params.set(key, String(value));
        });
      }
      router.push(`/search?${params.toString()}`);
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-sm">
          <Bookmark className="h-4 w-4" />
          Saved Searches
        </h3>

        {currentQuery && (
          <SavedSearchDialog
            filters={currentFilters}
            onSave={fetchSavedSearches}
            query={currentQuery}
          />
        )}
      </div>

      {savedSearches.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground text-sm">
          <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>No saved searches yet</p>
          <p>Save your searches for quick access</p>
        </div>
      ) : (
        <div className="space-y-2">
          {savedSearches.map((search) => (
            <div
              className="flex items-center justify-between rounded-[var(--radius-lg)] border p-3 transition-colors hover:bg-muted/50"
              key={search.id}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => applySearch(search)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{search.name}</h4>
                  {search.alertEnabled ? (
                    <Bell className="h-3 w-3 text-blue-500" />
                  ) : (
                    <BellOff className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  "{search.query}"
                  {search.filters && Object.keys(search.filters).length > 0 && (
                    <> • {Object.keys(search.filters).length} filters</>
                  )}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Saved {new Date(search.createdAt).toLocaleDateString()}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={deletingId === search.id}
                    size="icon"
                    variant="ghost"
                  >
                    {deletingId === search.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => applySearch(search)}>
                    <Search className="mr-2 h-4 w-4" />
                    Apply Search
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleAlerts(search.id, search.alertEnabled)}
                  >
                    {search.alertEnabled ? (
                      <>
                        <BellOff className="mr-2 h-4 w-4" />
                        Disable Alerts
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Enable Alerts
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteSearch(search.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
