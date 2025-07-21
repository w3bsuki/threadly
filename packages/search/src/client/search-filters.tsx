'use client';

import React from 'react';

export interface FilterOption {
  key: string;
  value: string | number;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'range';
}

interface SearchFiltersProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filterKey: string, value: any) => void;
  className?: string;
}

export function SearchFilters({ 
  filters, 
  selectedFilters, 
  onFilterChange,
  className = ''
}: SearchFiltersProps) {
  const handleFilterChange = (filterKey: string, value: any) => {
    onFilterChange(filterKey, value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {filters.map((filterGroup) => (
        <div key={filterGroup.key} className="border-b border-border pb-4">
          <h3 className="font-medium text-foreground mb-3">{filterGroup.label}</h3>
          
          {filterGroup.type === 'checkbox' && (
            <div className="space-y-2">
              {filterGroup.options.map((option) => (
                <label key={option.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters[filterGroup.key]?.includes(option.value) || false}
                    onChange={(e) => {
                      const currentValues = selectedFilters[filterGroup.key] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value);
                      handleFilterChange(filterGroup.key, newValues);
                    }}
                    className="h-4 w-4 text-blue-600 border-border rounded"
                  />
                  <span className="ml-2 text-sm text-secondary-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {filterGroup.type === 'radio' && (
            <div className="space-y-2">
              {filterGroup.options.map((option) => (
                <label key={option.key} className="flex items-center">
                  <input
                    type="radio"
                    name={filterGroup.key}
                    checked={selectedFilters[filterGroup.key] === option.value}
                    onChange={() => handleFilterChange(filterGroup.key, option.value)}
                    className="h-4 w-4 text-blue-600 border-border"
                  />
                  <span className="ml-2 text-sm text-secondary-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {filterGroup.type === 'range' && (
            <div className="space-y-2">
              <input
                type="range"
                min={filterGroup.options[0]?.value || 0}
                max={filterGroup.options[filterGroup.options.length - 1]?.value || 100}
                value={selectedFilters[filterGroup.key] || 0}
                onChange={(e) => handleFilterChange(filterGroup.key, Number(e.target.value))}
                className="w-full h-2 bg-accent rounded-[var(--radius-lg)] appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{filterGroup.options[0]?.label}</span>
                <span>{filterGroup.options[filterGroup.options.length - 1]?.label}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}