'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

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
  success: 'bg-blue-600 border-blue-700 text-white',
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
    <div
      className={cn(
        bannerVariants[variant],
        'overflow-hidden border-b',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            {icon && <div className="shrink-0 text-xl">{icon}</div>}
            <div className="animate-[scroll_15s_linear_infinite] whitespace-nowrap font-semibold text-lg">
              {children}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {action && (
              <Button
                className="h-auto p-0 text-xs underline underline-offset-2 hover:no-underline"
                onClick={action.onClick}
                size="sm"
                variant="ghost"
              >
                {action.label}
              </Button>
            )}

            {onDismiss && (
              <Button
                aria-label="Dismiss banner"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={onDismiss}
                size="sm"
                variant="ghost"
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
