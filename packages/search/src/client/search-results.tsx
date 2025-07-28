'use client';

import type React from 'react';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  [key: string]: any;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  error?: string | null;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
  renderResult?: (result: SearchResult) => React.ReactNode;
}

export function SearchResults({
  results,
  isLoading = false,
  error = null,
  onResultClick,
  className = '',
  renderResult,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-[var(--radius-full)] border-blue-500 border-b-2" />
        <span className="ml-2 text-muted-foreground">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-red-600">
          <p className="font-medium">Search Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`py-8 text-center ${className}`}>
        <div className="text-muted-foreground">
          <p className="font-medium text-lg">No results found</p>
          <p className="mt-1 text-sm">
            Try adjusting your search terms or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="mb-4 text-muted-foreground text-sm">
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <div
            className="cursor-pointer rounded-[var(--radius-lg)] border border-border p-4 transition-shadow hover:shadow-md"
            key={result.id}
            onClick={() => onResultClick?.(result)}
          >
            {renderResult ? (
              renderResult(result)
            ) : (
              <DefaultResultCard result={result} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultResultCard({ result }: { result: SearchResult }) {
  return (
    <div className="flex items-start space-x-4">
      {result.imageUrl && (
        <img
          alt={result.title}
          className="h-16 w-16 flex-shrink-0 rounded-[var(--radius-md)] object-cover"
          src={result.imageUrl}
        />
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-foreground text-lg">
          {result.title}
        </h3>
        {result.description && (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
            {result.description}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          {result.category && (
            <span className="inline-flex items-center rounded-[var(--radius-full)] bg-secondary px-2.5 py-0.5 font-medium text-secondary-foreground text-xs">
              {result.category}
            </span>
          )}
          {result.price && (
            <span className="font-bold text-green-600 text-lg">
              ${result.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
