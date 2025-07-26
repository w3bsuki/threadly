# Modern Design System 2025

## Overview

The Threadly design system has been updated to follow 2025 modern web standards, inspired by industry leaders like Vercel, Stripe, and Linear. This document outlines the key principles, components, and implementation guidelines.

## Core Principles

### 1. Mobile-First with 36px Touch Targets

The new standard for touch targets is **36px** (down from the traditional 44px iOS guideline), balancing modern compact interfaces with accessibility:

- **Default button height**: 36px (`h-9`)
- **Minimum touch target**: 32px for secondary actions
- **Large touch targets**: 40-44px for primary CTAs
- **Icon buttons**: 36px default with proper padding

### 2. Dark-First Design

Our color palette is optimized for dark mode as the primary experience:

```css
--background: 0 0% 3.9%;    /* #0a0a0a - Deep black */
--foreground: 0 0% 98%;     /* #fafafa - Off white */
--primary: 212 100% 50%;    /* #0084ff - Modern blue */
```

### 3. Subtle Shadows & Refined Borders

Modern interfaces use lighter shadows and refined borders:

```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--border: 217 19% 15%;      /* Subtle, not harsh */
```

### 4. Smaller Border Radii

Following the trend toward sharper, more refined corners:

- **Default radius**: 6px (`radius-md`)
- **Small elements**: 4px
- **Large cards**: 8-12px

## Spacing System

Based on a 4px grid for precision:

```
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-5: 1.25rem  (20px)
--space-6: 1.5rem   (24px)
--space-7: 1.75rem  (28px)
--space-8: 2rem     (32px)
--space-9: 2.25rem  (36px) ← Default touch target
--space-10: 2.5rem  (40px)
--space-11: 2.75rem (44px)
--space-12: 3rem    (48px) ← Accessibility minimum
```

## Component Guidelines

### Buttons

```tsx
// Modern button with 36px height
<Button>Continue</Button>

// Touch-optimized for mobile (40px min)
<Button size="touch">Buy Now</Button>

// Icon button with proper touch target
<Button size="icon" variant="ghost">
  <Heart className="h-4 w-4" />
</Button>

// Brand gradient for primary CTAs
<Button variant="brand-gradient">
  Add to Cart
</Button>
```

### Button Sizes

- `xs`: 28px - Compact UI elements
- `sm`: 32px - Secondary actions
- `default`: 36px - Standard (recommended)
- `lg`: 40px - Important actions
- `xl`: 44px - Primary CTAs
- `touch`: 40px min - Mobile optimized
- `touch-lg`: 44px min - Accessibility first

### Forms

Modern form inputs with refined styling:

```tsx
<Input className="h-9" /> // 36px height
<Select className="h-9" />
<Textarea className="min-h-[72px]" /> // 2x touch target
```

### Cards & Surfaces

```tsx
// Elevated card with subtle shadow
<Card className="shadow-sm hover:shadow-md transition-shadow">
  {content}
</Card>

// Dark mode optimized surface
<div className="bg-card border rounded-md p-4">
  {content}
</div>
```

## Typography

Refined type scale with system fonts:

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

## Animation & Transitions

Smooth, subtle animations:

```css
--duration-fast: 150ms;
--duration-normal: 250ms;
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

## Implementation Examples

### Mobile-First Product Card

```tsx
<Card className="group cursor-pointer transition-all hover:shadow-md">
  <CardContent className="p-3 sm:p-4">
    <AspectRatio ratio={1}>
      <img src={product.image} alt={product.name} />
    </AspectRatio>
    <div className="mt-3 space-y-2">
      <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
      <p className="text-lg font-semibold">${product.price}</p>
      <Button size="touch" className="w-full">
        Add to Cart
      </Button>
    </div>
  </CardContent>
</Card>
```

### Modern Header

```tsx
<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
  <div className="container flex h-14 items-center gap-4">
    <Logo className="h-6 w-auto" />
    <SearchBar className="flex-1 max-w-xl" />
    <nav className="flex items-center gap-2">
      <Button size="icon" variant="ghost">
        <ShoppingCart className="h-5 w-5" />
      </Button>
      <Button size="icon" variant="ghost">
        <User className="h-5 w-5" />
      </Button>
    </nav>
  </div>
</header>
```

### Responsive Touch Targets

```tsx
// Desktop: Compact 32px buttons
// Mobile: Expanded 40px touch targets
<div className="flex gap-2">
  <Button 
    size="sm" 
    className="sm:h-8 h-10"
  >
    Cancel
  </Button>
  <Button 
    size="sm" 
    className="sm:h-8 h-10"
  >
    Confirm
  </Button>
</div>
```

## Accessibility Considerations

1. **Focus States**: All interactive elements have clear focus indicators
2. **Touch Targets**: Minimum 32px, recommended 36px, ideal 40px+ for primary actions
3. **Color Contrast**: All text meets WCAG AA standards
4. **Keyboard Navigation**: Full keyboard support with logical tab order
5. **Screen Readers**: Proper ARIA labels and semantic HTML

## Migration Guide

### From Old to New Button Sizes

```diff
- <Button size="default">Click me</Button> // 44px
+ <Button>Click me</Button> // 36px

- <Button size="sm">Small</Button> // 36px
+ <Button size="sm">Small</Button> // 32px

- <Button className="h-12">Large</Button> // 48px
+ <Button size="xl">Large</Button> // 44px
```

### Update Touch Targets

```diff
- className="min-h-[44px]"
+ className="h-9" // 36px

- className="p-4" // 16px padding
+ className="p-3" // 12px padding
```

### Modern Shadows

```diff
- shadow-md hover:shadow-lg
+ shadow-sm hover:shadow-md

- shadow-xl
+ shadow-lg
```

## Testing Checklist

- [ ] All buttons are at least 32px tall
- [ ] Primary CTAs are 36-40px tall
- [ ] Touch targets have adequate spacing (minimum 8px gap)
- [ ] Focus states are clearly visible
- [ ] Animations respect prefers-reduced-motion
- [ ] Colors meet WCAG contrast requirements
- [ ] Components work well in both light and dark modes

## Resources

- [WCAG 2.1 Target Size Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Material Design Touch Targets](https://m3.material.io/foundations/designing/structure)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

## Version History

- **v2.0.0** (January 2025): Major update to 36px touch targets and modern styling
- **v1.0.0** (2024): Initial design system with 44px touch targets