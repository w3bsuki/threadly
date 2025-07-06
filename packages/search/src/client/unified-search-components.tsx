'use client';

/**
 * Unified Search Components
 * Ready-to-use search components for consistent UI across apps
 */

import React, { useState, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  Star, 
  Bookmark,
  BookmarkPlus,
  Bell,
  BellOff,
  Trash2,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { useSearch } from './unified-search-hook';
import type { SearchFilters, SavedSearch } from '../types';

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
const Button: React.FC<ButtonProps> = ({ children, onClick, className, variant = 'default', disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`px-4 py-2 rounded ${variant === 'outline' ? 'border' : 'bg-blue-500 text-white'} ${className}`}
  >
    {children}
  </button>
);

const Input: React.FC<InputProps> = ({ value, onChange, placeholder, className }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`px-3 py-2 border rounded ${className}`}
  />
);

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => (
  <span className={`px-2 py-1 text-xs rounded ${variant === 'outline' ? 'border' : 'bg-gray-200'} ${className}`}>
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
  placeholder = "Search products...",
  showSuggestions = true,
  className 
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

  const handleSearch = useCallback((searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch({ query: finalQuery });
      setShowDropdown(false);
    }
  }, [query, onSearch]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10 w-full"
        />
        <Button
          onClick={() => handleSearch()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
          size="sm"
        >
          Search
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && showSuggestions && (suggestions.length > 0 || history.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-50 mt-1">
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2">Suggestions</div>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <Search className="h-3 w-3 text-gray-400" />
                  <span>{suggestion.query}</span>
                  <Badge variant="outline" className="ml-auto">
                    {suggestion.count}
                  </Badge>
                </button>
              ))}
            </div>
          )}
          
          {history.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs text-gray-500 mb-2">Recent Searches</div>
              {history.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item.query)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
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

export function SearchHistory({ onSearchSelect, className }: SearchHistoryProps) {
  const { history, clearHistory, isLoading } = useSearch();

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No search history yet
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Searches</h3>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>
      
      <div className="space-y-2">
        {history.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => onSearchSelect(item.query)}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{item.query}</div>
                <div className="text-sm text-gray-500">
                  {item.resultsCount} results
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(item.timestamp).toLocaleDateString()}
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

export function SavedSearches({ onSearchSelect, className }: SavedSearchesProps) {
  const { 
    savedSearches, 
    deleteSavedSearch, 
    toggleSearchAlerts,
    updateSavedSearch,
    isLoading 
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
      <div className="p-4 text-center text-gray-500">
        No saved searches yet
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="font-semibold mb-4">Saved Searches</h3>
      
      <div className="space-y-3">
        {savedSearches.map((savedSearch) => (
          <div
            key={savedSearch.id}
            className="p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingId === savedSearch.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(savedSearch.id)}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="font-medium cursor-pointer hover:text-blue-600 mb-1"
                    onClick={() => onSearchSelect(savedSearch)}
                  >
                    {savedSearch.name}
                  </div>
                )}
                
                <div className="text-sm text-gray-600 mb-2">
                  {savedSearch.query}
                </div>
                
                <div className="text-xs text-gray-400">
                  Saved {new Date(savedSearch.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSearchAlerts(savedSearch.id, !savedSearch.alertsEnabled)}
                  className="p-1"
                >
                  {savedSearch.alertsEnabled ? (
                    <Bell className="h-4 w-4 text-blue-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(savedSearch)}
                  className="p-1"
                >
                  Edit
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSavedSearch(savedSearch.id)}
                  className="p-1 text-red-500 hover:text-red-600"
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

export function SaveSearchForm({ filters, onSave, onCancel, className }: SaveSearchFormProps) {
  const [name, setName] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), alertsEnabled);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-2">
          Search Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My search"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Search Query
        </label>
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
          {filters.query || 'No query'}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="alerts"
          checked={alertsEnabled}
          onChange={(e) => setAlertsEnabled(e.target.checked)}
        />
        <label htmlFor="alerts" className="text-sm">
          Get email alerts for new matches
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={!name.trim()}>
          Save Search
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}