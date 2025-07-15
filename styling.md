# Threadly Styling System Guide

## Architecture Overview

Threadly uses a sophisticated, mobile-first styling architecture built on:

- **Tailwind CSS v4.1.11** - Latest version with @source directive and enhanced features
- **Radix UI + shadcn/ui pattern** - Professional, accessible component library  
- **Custom Design System** - `/packages/design-system` with centralized styling
- **Mobile-First Approach** - Touch targets, responsive utilities, progressive enhancement

## Core Technologies

### Tailwind CSS v4 Features
```css
@import "tailwindcss";
@source "../components/**/*.{ts,tsx}";  // Auto-scanning for classes
@theme inline { ... }                   // Custom theme configuration
@custom-variant dark (&:is(.dark *));   // Advanced variant support
```

### Design System Structure
```
packages/design-system/
├── styles/globals.css        // Core styling & CSS variables
├── components.json          // shadcn/ui configuration  
├── components/ui/          // Reusable UI components
├── lib/utils.ts           // Styling utilities (cn, etc)
└── hooks/                // Custom styling hooks
```

## Mobile-Perfect Guidelines

### 1. Touch Targets (Already Implemented)
```css
/* Automatic 44px minimum touch targets on mobile */
.touch-target { min-height: 44px; min-width: 44px; touch-action: manipulation; }
.touch-target-lg { min-height: 48px; min-width: 48px; }
.touch-target-xl { min-height: 56px; min-width: 56px; }

/* Auto-applied to interactive elements @media (max-width: 768px) */
button, [role="button"], .clickable { min-height: 44px; min-width: 44px; }
```

### 2. Responsive Breakpoint System
```tsx
// Mobile-first approach
const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)  
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px' // XXL devices (large desktops)
}

// Usage pattern
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  {/* Mobile: full width, tablet: half, desktop: third, large: quarter */}
</div>
```

### 3. Mobile Layout Patterns

#### Responsive Grid System
```tsx
// Product grids
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
  {/* Auto-responsive product grid */}
</div>

// Dashboard cards
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Responsive dashboard layout */}
</div>
```

#### Mobile Navigation
```tsx
// Mobile-first navigation pattern
<nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
  {/* Mobile bottom navigation */}
</nav>

<nav className="hidden md:flex md:items-center md:space-x-4">
  {/* Desktop horizontal navigation */}
</nav>
```

### 4. Typography & Spacing

#### Mobile-Optimized Typography
```tsx
// Mobile-friendly text sizing
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
<h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
<p className="text-sm sm:text-base leading-relaxed">
```

#### Responsive Spacing
```tsx
// Progressive spacing enhancement
<div className="p-4 md:p-6 lg:p-8">         // Padding
<div className="space-y-4 md:space-y-6">    // Vertical spacing
<div className="gap-3 md:gap-4 lg:gap-6">   // Grid gaps
```

## Component Patterns

### 1. Mobile-First Button Components
```tsx
// Touch-optimized buttons
<Button 
  size="lg"                    // Minimum 44px height
  className="w-full md:w-auto" // Full width on mobile
>
  Action
</Button>

// Icon buttons with proper touch targets
<Button 
  variant="ghost" 
  size="icon"
  className="touch-target"     // Ensures 44px minimum
>
  <Icon />
</Button>
```

### 2. Responsive Card Components
```tsx
<Card className="w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg">
  <CardContent className="p-4 md:p-6">
    {/* Progressive enhancement */}
  </CardContent>
</Card>
```

### 3. Mobile Dialog/Modal Patterns
```tsx
// Mobile-optimized dialogs
<Dialog>
  <DialogContent className="w-[95vw] max-w-lg md:w-full">
    {/* 95% width on mobile, standard on desktop */}
  </DialogContent>
</Dialog>

// Sheet pattern for mobile
<Sheet>
  <SheetContent side="bottom" className="h-[80vh] md:h-auto">
    {/* Bottom sheet on mobile, side panel on desktop */}
  </SheetContent>
</Sheet>
```

## Advanced Mobile Features

### 1. Touch Gesture Support
```tsx
// Swipe gestures (implement with react-use-gesture)
const bind = useGesture({
  onSwipeLeft: () => nextPage(),
  onSwipeRight: () => prevPage(),
})

<div {...bind()} className="touch-pan-x">
  {/* Swipeable content */}
</div>
```

### 2. Pull-to-Refresh Pattern
```tsx
// Native-like pull-to-refresh
<div className="overscroll-behavior-none" onTouchStart={handlePullStart}>
  {/* Refreshable content */}
</div>
```

### 3. Mobile-Optimized Forms
```tsx
// Touch-friendly form inputs
<Input 
  className="text-base md:text-sm"  // Prevents zoom on iOS
  inputMode="numeric"               // Mobile keyboard optimization
  autoComplete="tel"                // Smart autofill
/>

// Grouped form actions
<div className="flex flex-col gap-3 md:flex-row md:justify-end">
  <Button variant="outline" className="order-2 md:order-1">Cancel</Button>
  <Button className="order-1 md:order-2">Submit</Button>
</div>
```

## Performance Optimizations

### 1. Responsive Images
```tsx
<Image
  src={src}
  alt={alt}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="w-full h-auto object-cover"
  priority={isAboveFold}
/>
```

### 2. Lazy Loading Patterns
```tsx
// Intersection Observer for mobile scrolling
const { ref, inView } = useInView({
  threshold: 0.1,
  triggerOnce: true,
  rootMargin: '50px 0px', // Load slightly before entering viewport
})
```

### 3. Mobile-First CSS Loading
```css
/* Critical mobile styles first */
@layer base {
  /* Mobile base styles */
}

@layer components {
  /* Component styles */
}

@layer utilities {
  /* Responsive utilities last */
}
```

## Accessibility for Mobile

### 1. Focus Management
```tsx
// Mobile-friendly focus indicators
<Button className="focus:ring-4 focus:ring-primary/20 focus:outline-none">
  {/* Large, visible focus states */}
</Button>
```

### 2. Screen Reader Support
```tsx
// Mobile screen reader optimization
<button 
  aria-label="Add to cart"
  className="sr-only-mobile md:sr-only"
>
  <Icon aria-hidden="true" />
  <span className="hidden md:inline">Add to Cart</span>
</button>
```

## Brand Colors & Theming

### Color System
```css
/* Clean brand palette (already implemented) */
:root {
  --brand-primary: oklch(0.2 0 0);           /* Clean Black */
  --brand-primary-foreground: oklch(1 0 0);  /* Pure White */
  --brand-secondary: oklch(0.96 0 0);        /* Light Gray */
  --brand-secondary-foreground: oklch(0.2 0 0);
}
```

### Dark Mode Support
```tsx
// Theme-aware components
<div className="bg-background text-foreground dark:bg-dark-background">
  {/* Automatic theme switching */}
</div>
```

## Implementation Best Practices

### 1. Mobile-First Development Workflow
1. Design mobile layout first (320px+)
2. Add tablet enhancements (768px+)  
3. Enhance for desktop (1024px+)
4. Optimize for large screens (1280px+)

### 2. Component Testing Strategy
```tsx
// Test across breakpoints
const breakpoints = ['320px', '768px', '1024px', '1280px']
breakpoints.forEach(width => {
  test(`Component renders correctly at ${width}`, () => {
    // Responsive testing
  })
})
```

### 3. Performance Monitoring
```tsx
// Mobile performance metrics
const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries()
  // Track mobile-specific metrics
})
```

## Quick Reference

### Common Mobile Classes
```css
/* Layout */
.container-mobile { max-width: 100vw; padding: 0 1rem; }
.safe-area-top { padding-top: env(safe-area-inset-top); }
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* Touch */
.touch-target { min-height: 44px; min-width: 44px; }
.tap-highlight-none { -webkit-tap-highlight-color: transparent; }

/* Scrolling */
.scroll-smooth { scroll-behavior: smooth; }
.overscroll-none { overscroll-behavior: none; }
```

### Responsive Utilities
```tsx
// Common responsive patterns
className="block md:hidden"           // Mobile only
className="hidden md:block"           // Desktop only  
className="text-sm md:text-base"      // Progressive text sizing
className="w-full md:w-auto"          // Full width mobile, auto desktop
className="flex-col md:flex-row"      // Stack mobile, row desktop
```

This styling system provides a solid foundation for creating mobile-perfect interfaces while maintaining design consistency and performance across all devices.