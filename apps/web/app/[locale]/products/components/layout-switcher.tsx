'use client';

import { useState, useEffect } from 'react';
import { Grid3X3, List, Grid2X2 } from 'lucide-react';
import { Button } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';

export type ViewMode = 'grid' | 'list' | 'compact';

interface LayoutSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function LayoutSwitcher({ currentView, onViewChange, className }: LayoutSwitcherProps) {
  useEffect(() => {
    // Load saved preference from localStorage
    const savedView = localStorage.getItem('productViewMode') as ViewMode;
    if (savedView && savedView !== currentView) {
      onViewChange(savedView);
    }
  }, []);

  const handleViewChange = (view: ViewMode) => {
    onViewChange(view);
    localStorage.setItem('productViewMode', view);
  };

  const views = [
    {
      id: 'grid' as ViewMode,
      icon: Grid3X3,
      label: 'Grid view',
      description: 'Standard product cards'
    },
    {
      id: 'list' as ViewMode,
      icon: List,
      label: 'List view',
      description: 'Horizontal layout with details'
    },
    {
      id: 'compact' as ViewMode,
      icon: Grid2X2,
      label: 'Compact view',
      description: 'More products per row'
    }
  ];

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <Button
            key={view.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewChange(view.id)}
            className={cn(
              'h-9 w-9 p-0',
              isActive 
                ? 'bg-gray-900 text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
            title={view.label}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{view.label}</span>
          </Button>
        );
      })}
    </div>
  );
}