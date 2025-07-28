'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Input } from '@repo/design-system/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BrandsSelectionProps {
  selectedBrands: string[];
  onSelect: (brands: string[]) => void;
}

const popularBrands = [
  'Nike',
  'Adidas',
  'Zara',
  'H&M',
  'Uniqlo',
  'Gucci',
  'Louis Vuitton',
  'Prada',
  'Versace',
  'Balenciaga',
  'Supreme',
  'Off-White',
  'Stone Island',
  'Ralph Lauren',
  'Tommy Hilfiger',
  'Calvin Klein',
  "Levi's",
  'Gap',
];

export function BrandsSelection({
  selectedBrands,
  onSelect,
}: BrandsSelectionProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = popularBrands.filter(
    (brand) =>
      brand.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedBrands.includes(brand)
  );

  const addBrand = (brand: string) => {
    if (brand && !selectedBrands.includes(brand)) {
      onSelect([...selectedBrands, brand]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeBrand = (brand: string) => {
    onSelect(selectedBrands.filter((b) => b !== brand));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addBrand(inputValue);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-semibold text-2xl">Any favorite brands?</h2>
        <p className="text-muted-foreground">
          Add brands you love to see more relevant items
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <div className="relative" ref={inputRef}>
          <Input
            className="pr-10"
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a brand name..."
            value={inputValue}
          />
          <Plus
            className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => addBrand(inputValue)}
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-[var(--radius-md)] border bg-popover shadow-md">
              {filteredSuggestions.map((brand) => (
                <button
                  className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  key={brand}
                  onClick={() => addBrand(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedBrands.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {selectedBrands.map((brand) => (
              <Badge
                className="py-1.5 pr-1 pl-3"
                key={brand}
                variant="secondary"
              >
                {brand}
                <button
                  className="ml-2 rounded-[var(--radius-full)] p-0.5 transition-colors hover:bg-background/20"
                  onClick={() => removeBrand(brand)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            Popular suggestions: {popularBrands.slice(0, 5).join(', ')}...
          </p>
        </div>
      </div>
    </div>
  );
}
