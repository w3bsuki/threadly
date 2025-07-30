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
  className = '',
}: SearchFiltersProps) {
  const handleFilterChange = (filterKey: string, value: any) => {
    onFilterChange(filterKey, value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {filters.map((filterGroup) => (
        <div className="border-border border-b pb-4" key={filterGroup.key}>
          <h3 className="mb-3 font-medium text-foreground">
            {filterGroup.label}
          </h3>

          {filterGroup.type === 'checkbox' && (
            <div className="space-y-2">
              {filterGroup.options.map((option) => (
                <label className="flex items-center" key={option.key}>
                  <input
                    checked={selectedFilters[filterGroup.key]?.includes(
                      option.value
                    )}
                    className="h-4 w-4 rounded border-border text-blue-600"
                    onChange={(e) => {
                      const currentValues =
                        selectedFilters[filterGroup.key] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: any) => v !== option.value);
                      handleFilterChange(filterGroup.key, newValues);
                    }}
                    type="checkbox"
                  />
                  <span className="ml-2 text-secondary-foreground text-sm">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {filterGroup.type === 'radio' && (
            <div className="space-y-2">
              {filterGroup.options.map((option) => (
                <label className="flex items-center" key={option.key}>
                  <input
                    checked={selectedFilters[filterGroup.key] === option.value}
                    className="h-4 w-4 border-border text-blue-600"
                    name={filterGroup.key}
                    onChange={() =>
                      handleFilterChange(filterGroup.key, option.value)
                    }
                    type="radio"
                  />
                  <span className="ml-2 text-secondary-foreground text-sm">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {filterGroup.type === 'range' && (
            <div className="space-y-2">
              <input
                className="h-2 w-full cursor-pointer appearance-none rounded-[var(--radius-lg)] bg-accent"
                max={
                  filterGroup.options[filterGroup.options.length - 1]?.value ||
                  100
                }
                min={filterGroup.options[0]?.value || 0}
                onChange={(e) =>
                  handleFilterChange(filterGroup.key, Number(e.target.value))
                }
                type="range"
                value={selectedFilters[filterGroup.key] || 0}
              />
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>{filterGroup.options[0]?.label}</span>
                <span>
                  {filterGroup.options[filterGroup.options.length - 1]?.label}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
