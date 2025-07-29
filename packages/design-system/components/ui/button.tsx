'use client';

import { Slot } from '@radix-ui/react-slot';
import { cn } from '@repo/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

const buttonVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium text-sm outline-none transition-colors duration-150 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          'bg-destructive text-background shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 active:scale-[0.98] dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground active:scale-[0.98] dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:scale-[0.98] dark:hover:bg-accent/50',
        link: "text-primary underline-offset-4 hover:underline",
        // THREADLY BRAND VARIANTS
        "brand-primary":
          'bg-[oklch(var(--brand-primary))] text-[oklch(var(--brand-primary-foreground))] shadow-xs transition-colors duration-150 hover:bg-[oklch(var(--brand-primary)/.9)] focus-visible:ring-[oklch(var(--brand-primary)/.3)] active:scale-[0.98]',
        "brand-secondary": 
          'bg-[oklch(var(--brand-secondary))] text-[oklch(var(--brand-secondary-foreground))] shadow-xs transition-colors duration-150 hover:bg-[oklch(var(--brand-secondary)/.9)] focus-visible:ring-[oklch(var(--brand-secondary)/.3)] active:scale-[0.98]',
        "brand-accent":
          'bg-[oklch(var(--brand-accent))] text-[oklch(var(--brand-accent-foreground))] shadow-xs transition-colors duration-150 hover:bg-[oklch(var(--brand-accent)/.9)] focus-visible:ring-[oklch(var(--brand-accent)/.3)] active:scale-[0.98]',
        "brand-gradient":
          'animate-gradient bg-[length:200%_200%] bg-gradient-to-r from-[oklch(var(--brand-primary))] via-[oklch(var(--brand-purple))] to-[oklch(var(--brand-accent))] font-semibold text-background shadow-lg transition-all duration-150 hover:opacity-90 hover:shadow-lg focus-visible:ring-[oklch(var(--brand-primary)/.4)] active:scale-[0.98]',
        "brand-outline":
          'border border-[oklch(var(--brand-primary))] bg-background text-[oklch(var(--brand-primary))] transition-colors duration-150 hover:bg-[oklch(var(--brand-primary))] hover:text-[oklch(var(--brand-primary-foreground))] focus-visible:ring-[oklch(var(--brand-primary)/.3)] active:scale-[0.98]',
        "brand-ghost":
          'text-[oklch(var(--brand-primary))] transition-colors duration-150 hover:bg-[oklch(var(--brand-primary)/.1)] hover:text-[oklch(var(--brand-primary))] focus-visible:ring-[oklch(var(--brand-primary)/.2)] active:scale-[0.98]',
        // MOBILE-SPECIFIC VARIANTS
        "mobile-primary":
          'w-full bg-[oklch(var(--brand-primary))] font-medium text-[oklch(var(--brand-primary-foreground))] shadow-md transition-colors duration-150 hover:bg-[oklch(var(--brand-primary)/.9)] focus-visible:ring-[oklch(var(--brand-primary)/.3)] active:scale-[0.98] sm:w-auto',
        "mobile-sticky":
          'w-full rounded-none bg-[oklch(var(--brand-primary))] font-semibold text-[oklch(var(--brand-primary-foreground))] shadow-lg transition-colors duration-150 hover:bg-[oklch(var(--brand-primary)/.9)] focus-visible:ring-[oklch(var(--brand-primary)/.3)] active:scale-[0.98] sm:rounded-[var(--radius-md)]',
        "quick-action":
          'bg-[oklch(var(--brand-accent))] text-[oklch(var(--brand-accent-foreground))] shadow-xs transition-all duration-150 hover:bg-[oklch(var(--brand-accent)/.9)] focus-visible:ring-[oklch(var(--brand-accent)/.3)] active:scale-[0.95] supports-[not(hover)]:active:bg-[oklch(var(--brand-accent)/.8)]',
      },
      size: {
        // Mobile-first touch target sizes
        xs: 'h-9 min-h-[36px] gap-1.5 px-3 text-xs before:absolute before:inset-[-4px] before:content-[""] has-[>svg]:px-2.5',
        sm: 'h-10 min-h-[40px] gap-2 px-3.5 text-sm has-[>svg]:px-3',
        default: 'h-11 min-h-[44px] px-4 text-sm has-[>svg]:px-3.5',
        lg: 'h-12 min-h-[48px] px-5 text-base has-[>svg]:px-4',
        xl: 'h-14 min-h-[56px] px-6 text-base has-[>svg]:px-5',
        // Icon sizes with minimum tap targets
        "icon-xs": 'size-9 min-h-[36px] min-w-[36px] before:absolute before:inset-[-4px] before:content-[""]',
        "icon-sm": "size-10 min-h-[40px] min-w-[40px]",
        "icon": "size-11 min-h-[44px] min-w-[44px]",
        "icon-lg": "size-12 min-h-[48px] min-w-[48px]", 
        "icon-xl": "size-14 min-h-[56px] min-w-[56px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-slot="button"
      data-touch-size={size || 'default'}
      data-touch-target="true"
      {...props}
    />
  );
}

export { Button, buttonVariants };
