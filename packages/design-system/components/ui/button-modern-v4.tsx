'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@repo/design-system/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all duration-fast disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-1 active:scale-[0.98] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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
        link: "text-primary underline-offset-4 hover:underline active:opacity-80 p-0 h-auto",
        // Modern gradient variants
        gradient:
          "bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-md hover:shadow-lg hover:opacity-90 active:opacity-95",
        "gradient-subtle":
          "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800",
      },
      size: {
        // Modern compact sizes - 36px default
        xs: "h-7 px-2.5 text-xs gap-1 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-3 text-sm gap-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        default: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
        xl: "h-11 px-6 text-base gap-2",
        // Icon sizes - matching height variants
        "icon-xs": "size-7 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon": "size-9 p-0",
        "icon-lg": "size-10 p-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-xl": "size-11 p-0 [&_svg:not([class*='size-'])]:size-5",
        // Touch-optimized sizes
        "touch": "h-10 px-4 text-sm touch-comfortable",
        "touch-lg": "h-11 px-5 text-base touch-large",
      },
      // Roundness options
      rounded: {
        default: "",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
        none: "rounded-none",
      },
      // Width options
      width: {
        auto: "",
        full: "w-full",
        fit: "w-fit",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      width: "auto",
    },
  }
)

// Loading spinner component
const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn("animate-spin", className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
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
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    rounded,
    width,
    asChild = false, 
    loading = false,
    loadingText,
    disabled,
    leftIcon,
    rightIcon,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Determine icon size based on button size
    const iconSize = {
      xs: "size-3.5",
      sm: "size-3.5",
      default: "size-4",
      lg: "size-4",
      xl: "size-5",
      "icon-xs": "size-3.5",
      "icon-sm": "size-4",
      "icon": "size-4",
      "icon-lg": "size-5",
      "icon-xl": "size-5",
      "touch": "size-4",
      "touch-lg": "size-5",
    }[size || "default"]

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, width, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        data-loading={loading}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner className={iconSize} />
        ) : leftIcon ? (
          <span className={cn("inline-flex shrink-0", iconSize)} aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        
        {/* Button text */}
        {loading && loadingText ? loadingText : children}
        
        {/* Right icon */}
        {!loading && rightIcon && (
          <span className={cn("inline-flex shrink-0", iconSize)} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }