'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@repo/design-system/components/ui/input';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Icons } from '@repo/design-system/components/icons';

interface BrandsSelectionProps {
  selectedBrands: string[];
  onSelect: (brands: string[]) => void;
}

const popularBrands = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Gucci', 
  'Louis Vuitton', 'Prada', 'Versace', 'Balenciaga',
  'Supreme', 'Off-White', 'Stone Island', 'Ralph Lauren',
  'Tommy Hilfiger', 'Calvin Klein', 'Levi\'s', 'Gap'
];

export function BrandsSelection({ selectedBrands, onSelect }: BrandsSelectionProps) {
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
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Any favorite brands?</h2>
        <p className="text-muted-foreground">
          Add brands you love to see more relevant items
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <div className="relative" ref={inputRef}>
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a brand name..."
            className="pr-10"
          />
          <Icons.plus
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => addBrand(inputValue)}
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
              {filteredSuggestions.map((brand) => (
                <button
                  key={brand}
                  onClick={() => addBrand(brand)}
                  className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm"
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedBrands.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedBrands.map((brand) => (
              <Badge
                key={brand}
                variant="secondary"
                className="pl-3 pr-1 py-1.5"
              >
                {brand}
                <button
                  onClick={() => removeBrand(brand)}
                  className="ml-2 p-0.5 hover:bg-background/20 rounded-full transition-colors"
                >
                  <Icons.x className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Popular suggestions: {popularBrands.slice(0, 5).join(', ')}...
          </p>
        </div>
      </div>
    </div>
  );
}