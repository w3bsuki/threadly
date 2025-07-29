import { Button } from '@repo/ui/components';
import { Filter, Search } from 'lucide-react';

interface SearchBarProps {
  placeholder: string;
  showCategories: boolean;
  onToggleCategories: () => void;
  searchRef: React.RefObject<HTMLDivElement | null>;
}

export function SearchBar({
  placeholder,
  showCategories,
  onToggleCategories,
  searchRef,
}: SearchBarProps) {
  return (
    <div className="mx-4 max-w-2xl flex-1 md:mx-8" ref={searchRef}>
      <div className="relative flex-1">
        <div className="flex items-center overflow-hidden rounded-[var(--radius-lg)] bg-secondary">
          <div className="flex flex-1 items-center px-4">
            <Search className="mr-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <input
              aria-label="Search products"
              className="w-full bg-transparent py-3 text-foreground placeholder-gray-500 transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder={placeholder}
              type="text"
            />
          </div>

          <Button
            aria-controls="categories-menu"
            aria-expanded={showCategories}
            aria-label="Toggle categories menu"
            className={`h-full w-10 rounded-none border-border border-l transition-all hover:bg-accent ${
              showCategories ? 'bg-accent' : ''
            }`}
            onClick={onToggleCategories}
            size="icon"
            variant="ghost"
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
