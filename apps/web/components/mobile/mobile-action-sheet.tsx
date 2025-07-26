'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@repo/design-system/components';
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
  description 
}: MobileActionSheetProps) {
  const handleAction = (action: Action) => {
    hapticFeedback.medium();
    action.handler();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className={cn(
          'max-h-[85vh] rounded-t-xl',
          'pb-[env(safe-area-inset-bottom)]'
        )}
      >
        {(title || description) && (
          <SheetHeader className="text-left pb-4">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
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
                key={action.id}
                onClick={() => handleAction(action)}
                variant={action.variant === 'destructive' ? 'destructive' : isPrimary ? 'default' : 'outline'}
                touchSize="comfortable"
                importance={isPrimary ? 'primary' : 'normal'}
                className={cn(
                  'w-full justify-start',
                  isPrimary && 'font-semibold'
                )}
              >
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                {action.label}
              </MobileButton>
            );
          })}
        </div>
        
        {/* Cancel button */}
        <div className="mt-4 pt-4 border-t">
          <MobileButton
            onClick={onClose}
            variant="ghost"
            touchSize="comfortable"
            className="w-full"
          >
            Cancel
          </MobileButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}