'use client';

import { Button, buttonVariants } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { forwardRef } from 'react';
import { hapticFeedback } from '@/lib/mobile/haptic-feedback';

// VariantProps imported via buttonVariants

/**
 * Touch target size constants following CONTEXT.md patterns
 */
const TOUCH_TARGET_SIZES = {
  minimum: 36, // Minimum viable size for less critical actions
  standard: 44, // Default size for most interactive elements
  comfortable: 48, // Recommended size for primary actions
  large: 56, // Maximum size for critical or frequently used actions
} as const;

export interface MobileButtonProps extends React.ComponentProps<typeof Button> {
  touchSize?: keyof typeof TOUCH_TARGET_SIZES | 'auto';
  importance?: 'normal' | 'primary' | 'critical';
  enableHaptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy';
}

/**
 * Mobile-optimized button with contextual touch target sizing
 * Following CONTEXT.md mobile-first patterns
 */
export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      touchSize = 'standard',
      importance = 'normal',
      enableHaptic = true,
      hapticType = 'light',
      onClick,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Contextual size calculation
    const targetSize =
      touchSize === 'auto'
        ? importance === 'critical'
          ? TOUCH_TARGET_SIZES.large
          : importance === 'primary'
            ? TOUCH_TARGET_SIZES.comfortable
            : TOUCH_TARGET_SIZES.standard
        : TOUCH_TARGET_SIZES[touchSize];

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableHaptic) {
        hapticFeedback[hapticType]();
      }
      onClick?.(e);
    };

    return (
      <Button
        className={cn(
          'relative flex items-center justify-center',
          `min-h-[${targetSize}px] min-w-[${targetSize}px]`,
          'touch-manipulation', // Disable double-tap zoom
          'transition-transform duration-100 active:scale-95',
          className
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
MobileButton.displayName = 'MobileButton';
