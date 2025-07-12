'use client';

import * as React from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { LoaderIcon } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';

export interface CursorPaginationState {
  cursor?: string;
  hasNextPage: boolean;
  isLoading: boolean;
  totalCount?: number;
}

export interface CursorPaginationProps {
  state: CursorPaginationState;
  onLoadMore: () => void;
  loadMoreText?: string;
  className?: string;
  showStats?: boolean;
  pageSize?: number;
  currentCount?: number;
}

export function CursorPagination({
  state,
  onLoadMore,
  loadMoreText = 'Load More',
  className,
  showStats = true,
  pageSize = 20,
  currentCount = 0,
}: CursorPaginationProps) {
  const { hasNextPage, isLoading, totalCount } = state;

  if (!hasNextPage) {
    return showStats && totalCount ? (
      <div className={cn('text-center text-sm text-muted-foreground py-4', className)}>
        Showing all {totalCount} items
      </div>
    ) : null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-4 py-6', className)}>
      {showStats && totalCount && (
        <div className="text-sm text-muted-foreground">
          Showing {currentCount} of {totalCount} items
        </div>
      )}
      
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
        variant="outline"
        size="lg"
        className="min-w-32"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </>
        ) : (
          loadMoreText
        )}
      </Button>
    </div>
  );
}

// Hook for managing cursor pagination state
export function useCursorPagination(initialState?: Partial<CursorPaginationState>) {
  const [state, setState] = React.useState<CursorPaginationState>({
    hasNextPage: true,
    isLoading: false,
    ...initialState,
  });

  const updateState = React.useCallback((updates: Partial<CursorPaginationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = React.useCallback(() => {
    setState({
      cursor: undefined,
      hasNextPage: true,
      isLoading: false,
      totalCount: undefined,
    });
  }, []);

  return {
    state,
    updateState,
    reset,
  };
}