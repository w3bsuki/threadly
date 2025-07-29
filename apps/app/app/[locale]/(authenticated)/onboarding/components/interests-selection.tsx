'use client';

import { Badge } from '@repo/ui/components/ui/badge';
import { cn } from '@repo/ui/lib/utils';
import { useEffect, useState } from 'react';
import { getCategories } from '../actions';

interface InterestsSelectionProps {
  selectedInterests: string[];
  onSelect: (interests: string[]) => void;
}

export function InterestsSelection({
  selectedInterests,
  onSelect,
}: InterestsSelectionProps): React.JSX.Element {
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleInterest = (categoryId: string) => {
    if (selectedInterests.includes(categoryId)) {
      onSelect(selectedInterests.filter((id) => id !== categoryId));
    } else {
      onSelect([...selectedInterests, categoryId]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6 text-center">
          <h2 className="mb-2 font-semibold text-2xl">Loading categories...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 text-center">
        <h2 className="mb-2 font-semibold text-2xl">
          What are you interested in?
        </h2>
        <p className="text-muted-foreground">
          Select categories to personalize your feed
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.id);

          return (
            <Badge
              className={cn(
                'cursor-pointer px-4 py-2 text-sm transition-all',
                'hover:scale-105',
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-accent'
              )}
              key={category.id}
              onClick={() => toggleInterest(category.id)}
              variant={isSelected ? 'default' : 'outline'}
            >
              {category.name}
            </Badge>
          );
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {selectedInterests.length} categories selected
          </p>
        </div>
      )}
    </div>
  );
}
