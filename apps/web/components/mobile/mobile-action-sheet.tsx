'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';
import { MobileButton } from './mobile-button';

interface Action {
  id: string;
  label: string;
  handler: () => void;
  variant?: 'default' | 'destructive';
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileActionSheetProps {
  actions: Action[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * Mobile-optimized action sheet for one-handed operation
 * Following CONTEXT.md patterns for mobile UI
 */
export function MobileActionSheet({
  actions,
  isOpen,
  onClose,
  title,
  description,
}: MobileActionSheetProps) {
  const handleAction = (action: Action) => {
    hapticFeedback.medium();
    action.handler();
    onClose();
  };

  return (
    <Sheet onOpenChange={onClose} open={isOpen}>
      <SheetContent
        className={cn(
          'max-h-[85vh] rounded-t-xl',
          'pb-[env(safe-area-inset-bottom)]'
        )}
        side="bottom"
      >
        {(title || description) && (
          <SheetHeader className="pb-4 text-left">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </SheetHeader>
        )}

        {/* Primary actions at bottom for easy reach */}
        <div className="flex flex-col-reverse gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isPrimary = index === 0;

            return (
              <MobileButton
                className={cn(
                  'w-full justify-start',
                  isPrimary && 'font-semibold'
                )}
                importance={isPrimary ? 'primary' : 'normal'}
                key={action.id}
                onClick={() => handleAction(action)}
                touchSize="comfortable"
                variant={
                  action.variant === 'destructive'
                    ? 'destructive'
                    : isPrimary
                      ? 'default'
                      : 'outline'
                }
              >
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                {action.label}
              </MobileButton>
            );
          })}
        </div>

        {/* Cancel button */}
        <div className="mt-4 border-t pt-4">
          <MobileButton
            className="w-full"
            onClick={onClose}
            touchSize="comfortable"
            variant="ghost"
          >
            Cancel
          </MobileButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
