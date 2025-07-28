'use client';

import { Badge, Button, Input } from '@repo/design-system/components';
import { useAutocomplete, useSearchHistory } from '@repo/search/client';
import { ArrowRightIcon, Clock, SearchIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { suggestions, loading } = useAutocomplete(query, showDropdown);
  const { history, addToHistory, removeFromHistory } = useSearchHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToHistory(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: {
    title: string;
    image?: string;
    brand?: string;
    category?: string;
    price: number;
  }) => {
    setQuery(suggestion.title);
    addToHistory(suggestion.title);
    router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
    setShowDropdown(false);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    router.push(`/search?q=${encodeURIComponent(historyItem)}`);
    setShowDropdown(false);
  };

  const handleRemoveHistory = (historyItem: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(historyItem);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSuggestions = suggestions.length > 0 && query.length >= 2;
  const showHistory = history.length > 0 && query.length === 0;

  return (
    <div className="relative w-full max-w-md">
      <form className="flex items-center gap-2 px-4" onSubmit={handleSubmit}>
        <div className="relative w-full">
          <div className="absolute top-px bottom-px left-px flex h-8 w-8 items-center justify-center">
            <SearchIcon className="text-muted-foreground" size={16} />
          </div>
          <Input
            className="h-auto w-full bg-background py-1.5 pr-3 pl-8 text-xs"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search products, brands, categories..."
            ref={inputRef}
            type="text"
            value={query}
          />
          <Button
            className="absolute top-px right-px bottom-px h-8 w-8"
            size="icon"
            type="submit"
            variant="ghost"
          >
            <ArrowRightIcon className="text-muted-foreground" size={16} />
          </Button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (showSuggestions || showHistory) && (
        <div
          className="absolute top-full right-4 left-4 z-50 mt-1 max-h-80 overflow-y-auto rounded-[var(--radius-md)] border bg-background shadow-lg"
          ref={dropdownRef}
        >
          {/* Search History */}
          {showHistory && (
            <div className="p-2">
              <div className="mb-2 px-2 text-muted-foreground text-xs">
                Recent searches
              </div>
              {history.slice(0, 5).map((item, index) => (
                <div
                  className="group flex cursor-pointer items-center justify-between rounded px-2 py-1.5 hover:bg-muted"
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground" size={12} />
                    <span className="text-sm">{item}</span>
                  </div>
                  <Button
                    className="h-auto p-1 opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleRemoveHistory(item, e)}
                    size="sm"
                    variant="ghost"
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="p-2">
              {loading && (
                <div className="mb-2 px-2 text-muted-foreground text-xs">
                  Loading...
                </div>
              )}
              {!loading && (
                <>
                  <div className="mb-2 px-2 text-muted-foreground text-xs">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-muted"
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.image && (
                        <img
                          alt={suggestion.title}
                          className="h-8 w-8 rounded object-cover"
                          src={suggestion.image}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-sm">
                          {suggestion.title}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                          {suggestion.brand && (
                            <Badge className="text-xs" variant="secondary">
                              {suggestion.brand}
                            </Badge>
                          )}
                          {suggestion.category && (
                            <span>{suggestion.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-sm">
                        ${suggestion.price}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
