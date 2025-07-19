'use client';

import React from 'react';

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
  renderResult
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-[var(--radius-full)] h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-muted-foreground">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-[var(--radius-md)] p-4">
          <p className="font-medium">Search Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm text-muted-foreground mb-4">
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </div>
      
      <div className="grid gap-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="border border-border rounded-[var(--radius-lg)] p-4 hover:shadow-md transition-shadow cursor-pointer"
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
          src={result.imageUrl}
          alt={result.title}
          className="w-16 h-16 object-cover rounded-[var(--radius-md)] flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-foreground truncate">
          {result.title}
        </h3>
        {result.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {result.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          {result.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius-full)] text-xs font-medium bg-secondary text-secondary-foreground">
              {result.category}
            </span>
          )}
          {result.price && (
            <span className="text-lg font-bold text-green-600">
              ${result.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}