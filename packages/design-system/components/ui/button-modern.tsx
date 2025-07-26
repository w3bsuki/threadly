'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@repo/design-system/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1 active:scale-[0.98] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95 focus-visible:ring-destructive/20",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/90",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
        // Modern gradient variants
        gradient:
          "bg-gradient-to-r from-[oklch(var(--brand-primary))] to-[oklch(var(--brand-accent))] text-white shadow-md hover:shadow-lg hover:opacity-90 active:opacity-95 transition-all duration-200",
        "gradient-outline":
          "border bg-background bg-clip-padding hover:bg-accent relative before:absolute before:inset-0 before:rounded-[inherit] before:p-[1px] before:bg-gradient-to-r before:from-[oklch(var(--brand-primary))] before:to-[oklch(var(--brand-accent))] before:-z-10",
      },
      size: {
        // Modern compact sizes - 36px default touch target
        xs: "h-7 px-2 text-xs gap-1 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-3 text-sm gap-1.5",
        default: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
        xl: "h-11 px-6 text-base",
        // Icon sizes
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon": "size-9",
        "icon-lg": "size-10",
        "icon-xl": "size-11",
      },
      // Modern roundness options
      rounded: {
        default: "rounded-[var(--radius-md)]",
        sm: "rounded-[var(--radius-sm)]",
        lg: "rounded-[var(--radius-lg)]",
        xl: "rounded-[var(--radius-xl)]",
        full: "rounded-[var(--radius-full)]",
        none: "rounded-none",
      },
      // Loading state
      loading: {
        true: "relative text-transparent pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      loading: false,
    },
  }
)

const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <svg
      className="animate-spin size-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  </div>
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    asChild = false, 
    loading = false,
    loadingText,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        data-loading={loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        <span className={loading ? "opacity-0" : ""}>
          {loading && loadingText ? loadingText : children}
        </span>
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }