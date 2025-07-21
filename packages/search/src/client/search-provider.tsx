'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { MarketplaceSearchService } from '../search-service';

interface SearchContextType {
  searchService: MarketplaceSearchService;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  children: ReactNode;
  searchService: MarketplaceSearchService;
}

export function SearchProvider({ children, searchService }: SearchProviderProps) {
  return (
    <SearchContext.Provider value={{ searchService }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}