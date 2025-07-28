'use client';

/**
 * Unified Search Components
 * Ready-to-use search components for consistent UI across apps
 */

import {
  Bell,
  BellOff,
  Bookmark,
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import type { SavedSearch, SearchFilters } from '../types';
import { useSearch } from './unified-search-hook';

// These components assume you have a design system with these components
// Adjust imports based on your actual design system
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'outline';
  children: React.ReactNode;
  className?: string;
}

// Mock components - replace with your actual design system components
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'default',
  disabled,
}) => (
  <button
    className={`rounded px-4 py-2 ${variant === 'outline' ? 'border' : 'bg-blue-500 text-white'} ${className}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => (
  <input
    className={`rounded border px-3 py-2 ${className}`}
    onChange={onChange}
    placeholder={placeholder}
    type="text"
    value={value}
  />
);

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => (
  <span
    className={`rounded px-2 py-1 text-xs ${variant === 'outline' ? 'border' : 'bg-gray-200'} ${className}`}
  >
    {children}
  </span>
);

/**
 * Unified Search Bar with autocomplete
 */
export interface UnifiedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export function UnifiedSearchBar({
  onSearch,
  placeholder = 'Search products...',
  showSuggestions = true,
  className,
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { suggestions, getSuggestions, history } = useSearch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (showSuggestions && value.trim()) {
      getSuggestions(value);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const finalQuery = searchQuery || query;
      if (finalQuery.trim()) {
        onSearch({ query: finalQuery });
        setShowDropdown(false);
      }
    },
    [query, onSearch]
  );

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
        <Input
          className="w-full pr-10 pl-10"
          onChange={handleInputChange}
          placeholder={placeholder}
          value={query}
        />
        <Button
          className="-translate-y-1/2 absolute top-1/2 right-1 transform"
          onClick={() => handleSearch()}
          size="sm"
        >
          Search
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown &&
        showSuggestions &&
        (suggestions.length > 0 || history.length > 0) && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border bg-white shadow-lg">
            {suggestions.length > 0 && (
              <div className="p-2">
                <div className="mb-2 text-gray-500 text-xs">Suggestions</div>
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-gray-100"
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                  >
                    <Search className="h-3 w-3 text-gray-400" />
                    <span>{suggestion.query}</span>
                    <Badge className="ml-auto" variant="outline">
                      {suggestion.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {history.length > 0 && (
              <div className="border-t p-2">
                <div className="mb-2 text-gray-500 text-xs">
                  Recent Searches
                </div>
                {history.slice(0, 3).map((item, index) => (
                  <button
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-gray-100"
                    key={index}
                    onClick={() => handleSuggestionClick(item.query)}
                  >
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span>{item.query}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}

/**
 * Search History Component
 */
export interface SearchHistoryProps {
  onSearchSelect: (query: string) => void;
  className?: string;
}

export function SearchHistory({
  onSearchSelect,
  className,
}: SearchHistoryProps) {
  const { history, clearHistory, isLoading } = useSearch();

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No search history yet</div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Recent Searches</h3>
        <Button onClick={clearHistory} size="sm" variant="ghost">
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            className="flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-50"
            key={index}
            onClick={() => onSearchSelect(item.query)}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{item.query}</div>
                <div className="text-gray-500 text-sm">
                  {item.resultCount} results
                </div>
              </div>
            </div>
            <div className="text-gray-400 text-xs">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Saved Searches Component
 */
export interface SavedSearchesProps {
  onSearchSelect: (savedSearch: SavedSearch) => void;
  className?: string;
}

export function SavedSearches({
  onSearchSelect,
  className,
}: SavedSearchesProps) {
  const {
    savedSearches,
    deleteSavedSearch,
    toggleSearchAlerts,
    updateSavedSearch,
    isLoading,
  } = useSearch();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleEdit = (savedSearch: SavedSearch) => {
    setEditingId(savedSearch.id);
    setEditingName(savedSearch.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (editingName.trim()) {
      await updateSavedSearch(id, { name: editingName.trim() });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (savedSearches.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No saved searches yet</div>
    );
  }

  return (
    <div className={className}>
      <h3 className="mb-4 font-semibold">Saved Searches</h3>

      <div className="space-y-3">
        {savedSearches.map((savedSearch) => (
          <div
            className="rounded-lg border p-3 hover:bg-gray-50"
            key={savedSearch.id}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingId === savedSearch.id ? (
                  <div className="mb-2 flex items-center gap-2">
                    <Input
                      className="text-sm"
                      onChange={(e) => setEditingName(e.target.value)}
                      value={editingName}
                    />
                    <Button
                      onClick={() => handleSaveEdit(savedSearch.id)}
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="ghost"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div
                    className="mb-1 cursor-pointer font-medium hover:text-blue-600"
                    onClick={() => onSearchSelect(savedSearch)}
                  >
                    {savedSearch.name}
                  </div>
                )}

                <div className="mb-2 text-gray-600 text-sm">
                  {savedSearch.query}
                </div>

                <div className="text-gray-400 text-xs">
                  Saved {new Date(savedSearch.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="ml-2 flex items-center gap-1">
                <Button
                  className="p-1"
                  onClick={() =>
                    toggleSearchAlerts(
                      savedSearch.id,
                      !savedSearch.alertEnabled
                    )
                  }
                  size="sm"
                  variant="ghost"
                >
                  {savedSearch.alertEnabled ? (
                    <Bell className="h-4 w-4 text-blue-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>

                <Button
                  className="p-1"
                  onClick={() => handleEdit(savedSearch)}
                  size="sm"
                  variant="ghost"
                >
                  Edit
                </Button>

                <Button
                  className="p-1 text-red-500 hover:text-red-600"
                  onClick={() => deleteSavedSearch(savedSearch.id)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Save Search Dialog/Form
 */
export interface SaveSearchFormProps {
  filters: SearchFilters;
  onSave: (name: string, alertsEnabled: boolean) => void;
  onCancel: () => void;
  className?: string;
}

export function SaveSearchForm({
  filters,
  onSave,
  onCancel,
  className,
}: SaveSearchFormProps) {
  const [name, setName] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), alertsEnabled);
    }
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block font-medium text-sm">Search Name</label>
        <Input
          className="w-full"
          onChange={(e) => setName(e.target.value)}
          placeholder="My search"
          value={name}
        />
      </div>

      <div>
        <label className="mb-2 block font-medium text-sm">Search Query</label>
        <div className="rounded bg-gray-50 p-2 text-gray-600 text-sm">
          {filters.query || 'No query'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          checked={alertsEnabled}
          id="alerts"
          onChange={(e) => setAlertsEnabled(e.target.checked)}
          type="checkbox"
        />
        <label className="text-sm" htmlFor="alerts">
          Get email alerts for new matches
        </label>
      </div>

      <div className="flex gap-2">
        <Button disabled={!name.trim()}>Save Search</Button>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
      </div>
    </form>
  );
}
