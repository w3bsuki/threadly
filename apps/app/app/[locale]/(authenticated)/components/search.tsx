'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { useAutocomplete, useSearchHistory } from '@repo/search/client';
import { ArrowRightIcon, SearchIcon, Clock, X } from 'lucide-react';

export const Search = (): React.JSX.Element => {
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

  const handleSuggestionClick = (suggestion: any) => {
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
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4">
        <div className="relative w-full">
          <div className="absolute top-px bottom-px left-px flex h-8 w-8 items-center justify-center">
            <SearchIcon size={16} className="text-muted-foreground" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search products, brands, categories..."
            className="h-auto bg-background py-1.5 pr-3 pl-8 text-xs w-full"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute top-px right-px bottom-px h-8 w-8"
          >
            <ArrowRightIcon size={16} className="text-muted-foreground" />
          </Button>
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (showSuggestions || showHistory) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-4 right-4 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Search History */}
          {showHistory && (
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2">Recent searches</div>
              {history.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-muted rounded cursor-pointer group"
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-sm">{item}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-auto p-1"
                    onClick={(e) => handleRemoveHistory(item, e)}
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
                <div className="text-xs text-muted-foreground mb-2 px-2">Loading...</div>
              )}
              {!loading && (
                <>
                  <div className="text-xs text-muted-foreground mb-2 px-2">Suggestions</div>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 px-2 py-2 hover:bg-muted rounded cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.image && (
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{suggestion.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          {suggestion.brand && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.brand}
                            </Badge>
                          )}
                          {suggestion.category && (
                            <span>{suggestion.category}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
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
