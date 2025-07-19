'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/design-system/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-background shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        // THREADLY BRAND VARIANTS
        "brand-primary":
          "bg-[oklch(var(--brand-primary))] text-[oklch(var(--brand-primary-foreground))] shadow-xs hover:bg-[oklch(var(--brand-primary)/.9)] focus-visible:ring-[oklch(var(--brand-primary)/.3)] transition-colors duration-150",
        "brand-secondary": 
          "bg-[oklch(var(--brand-secondary))] text-[oklch(var(--brand-secondary-foreground))] shadow-xs hover:bg-[oklch(var(--brand-secondary)/.9)] focus-visible:ring-[oklch(var(--brand-secondary)/.3)] transition-colors duration-150",
        "brand-accent":
          "bg-[oklch(var(--brand-accent))] text-[oklch(var(--brand-accent-foreground))] shadow-xs hover:bg-[oklch(var(--brand-accent)/.9)] focus-visible:ring-[oklch(var(--brand-accent)/.3)] transition-colors duration-150",
        "brand-gradient":
          "bg-gradient-to-r from-[oklch(var(--brand-primary))] via-[oklch(var(--brand-purple))] to-[oklch(var(--brand-accent))] text-background shadow-lg hover:shadow-lg hover:opacity-90 focus-visible:ring-[oklch(var(--brand-primary)/.4)] animate-gradient bg-[length:200%_200%] font-semibold transition-all duration-150",
        "brand-outline":
          "border border-[oklch(var(--brand-primary))] text-[oklch(var(--brand-primary))] bg-background hover:bg-[oklch(var(--brand-primary))] hover:text-[oklch(var(--brand-primary-foreground))] focus-visible:ring-[oklch(var(--brand-primary)/.3)] transition-colors duration-150",
        "brand-ghost":
          "text-[oklch(var(--brand-primary))] hover:bg-[oklch(var(--brand-primary)/.1)] hover:text-[oklch(var(--brand-primary))] focus-visible:ring-[oklch(var(--brand-primary)/.2)] transition-colors duration-150",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-[var(--radius-md)] gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-[var(--radius-md)] px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-[var(--radius-lg)] px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10", 
        "icon-xl": "size-12",
        // Mobile-optimized sizes (44px minimum touch target)
        "mobile": "h-11 px-4 py-2 has-[>svg]:px-3 min-h-[44px]",
        "mobile-lg": "h-12 px-6 py-3 has-[>svg]:px-4 min-h-[44px] text-base",
        "mobile-icon": "size-11 min-h-[44px] min-w-[44px]",
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
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
