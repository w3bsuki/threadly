'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';
import { LoaderIcon } from 'lucide-react';
import * as React from 'react';

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
      <div
        className={cn(
          'py-4 text-center text-muted-foreground text-sm',
          className
        )}
      >
        Showing all {totalCount} items
      </div>
    ) : null;
  }

  return (
    <div className={cn('flex flex-col items-center gap-4 py-6', className)}>
      {showStats && totalCount && (
        <div className="text-muted-foreground text-sm">
          Showing {currentCount} of {totalCount} items
        </div>
      )}

      <Button
        className="min-w-32"
        disabled={isLoading}
        onClick={onLoadMore}
        size="lg"
        variant="outline"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
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
export function useCursorPagination(
  initialState?: Partial<CursorPaginationState>
) {
  const [state, setState] = React.useState<CursorPaginationState>({
    hasNextPage: true,
    isLoading: false,
    ...initialState,
  });

  const updateState = React.useCallback(
    (updates: Partial<CursorPaginationState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

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
