'use client';

import { Button } from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import { Grid2X2, Grid3X3, List } from 'lucide-react';
import { useEffect } from 'react';

export type ViewMode = 'grid' | 'list' | 'compact';

interface LayoutSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function LayoutSwitcher({
  currentView,
  onViewChange,
  className,
}: LayoutSwitcherProps) {
  useEffect(() => {
    // Load saved preference from localStorage
    const savedView = localStorage.getItem('productViewMode') as ViewMode;
    if (savedView && savedView !== currentView) {
      onViewChange(savedView);
    }
  }, [currentView, onViewChange]);

  const handleViewChange = (view: ViewMode) => {
    onViewChange(view);
    localStorage.setItem('productViewMode', view);
  };

  const views = [
    {
      id: 'grid' as ViewMode,
      icon: Grid3X3,
      label: 'Grid view',
      description: 'Standard product cards',
    },
    {
      id: 'list' as ViewMode,
      icon: List,
      label: 'List view',
      description: 'Horizontal layout with details',
    },
    {
      id: 'compact' as ViewMode,
      icon: Grid2X2,
      label: 'Compact view',
      description: 'More products per row',
    },
  ];

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;

        return (
          <Button
            className={cn(
              'h-9 w-9 p-0',
              isActive
                ? 'bg-foreground text-background hover:bg-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            key={view.id}
            onClick={() => handleViewChange(view.id)}
            size="sm"
            title={view.label}
            variant={isActive ? 'default' : 'outline'}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
