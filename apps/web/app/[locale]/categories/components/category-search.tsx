'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const CategorySearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  }, [search, router, searchParams]);

  return (
    <div className="relative mb-8">
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
      <input
        className="w-full max-w-md rounded-[var(--radius-lg)] border border-border bg-background py-3 pr-4 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories..."
        type="text"
        value={search}
      />
    </div>
  );
};
