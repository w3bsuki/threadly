'use client';

import type React from 'react';
import { useCallback, useState } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export function SearchBox({
  onSearch,
  placeholder = 'Search products...',
  className = '',
  initialValue = '',
}: SearchBoxProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(query);
    },
    [query, onSearch]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  return (
    <form className={className} onSubmit={handleSubmit}>
      <input
        className="w-full rounded-[var(--radius-md)] border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={handleInputChange}
        placeholder={placeholder}
        type="text"
        value={query}
      />
      <button
        className="ml-2 rounded-[var(--radius-md)] bg-blue-500 px-4 py-2 text-background hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}
