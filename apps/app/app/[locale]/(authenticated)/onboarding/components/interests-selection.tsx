'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@repo/design-system/components/ui/badge';
import { cn } from '@repo/design-system/lib/utils';
import { getCategories } from '../actions';

interface InterestsSelectionProps {
  selectedInterests: string[];
  onSelect: (interests: string[]) => void;
}

export function InterestsSelection({ selectedInterests, onSelect }: InterestsSelectionProps): React.JSX.Element {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
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
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Loading categories...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">What are you interested in?</h2>
        <p className="text-muted-foreground">
          Select categories to personalize your feed
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => {
          const isSelected = selectedInterests.includes(category.id);
          
          return (
            <Badge
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-4 py-2 text-sm transition-all',
                'hover:scale-105',
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-accent'
              )}
              onClick={() => toggleInterest(category.id)}
            >
              {category.name}
            </Badge>
          );
        })}
      </div>

      {selectedInterests.length > 0 && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            {selectedInterests.length} categories selected
          </p>
        </div>
      )}
    </div>
  );
}