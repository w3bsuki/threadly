'use client';

import { Button } from './button';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface BannerProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'info' | 'warning';
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const bannerVariants = {
  default: 'bg-muted border-border text-foreground',
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

export function Banner({
  children,
  variant = 'default',
  icon,
  action,
  onDismiss,
  className,
}: BannerProps) {
  return (
    <div className={cn(bannerVariants[variant], 'border-b', className)}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && <div className="shrink-0">{icon}</div>}
            <div className="text-sm font-medium truncate">{children}</div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className="h-auto p-0 text-xs underline underline-offset-2 hover:no-underline"
              >
                {action.label}
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-black/10"
                aria-label="Dismiss banner"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}