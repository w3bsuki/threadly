# Design Tokens Usage Guide

## Overview

Threadly's design tokens provide a comprehensive mobile-first foundation for building consistent, accessible interfaces across web and app platforms.

## Installation

The tokens are automatically available when you import from `@repo/design-system`:

```typescript
import { tokens, useTokens } from '@repo/design-system/components';
// or
import tokens from '@repo/design-system/lib/tokens';
```

## Core Token Categories

### 1. Touch Targets
Ensure all interactive elements meet minimum touch target sizes:

```tsx
// Using Tailwind classes
<button className="touch-md">Click me</button>

// Using tokens directly
<button style={{ minHeight: tokens.touchTargets.md }}>Click me</button>

// Using the hook
const { getTouchTarget } = useTokens();
<button style={getTouchTarget('md')}>Click me</button>
```

**Sizes:**
- `xs` (36px): Dense product cards, compact lists
- `sm` (40px): Standard buttons, inputs
- `md` (44px): Primary CTAs (recommended minimum)
- `lg` (48px): Checkout actions
- `xl` (56px): Mobile bottom bar CTAs

### 2. Spacing (8-point Grid)
Maintain visual consistency with our spacing scale:

```tsx
// Tailwind
<div className="p-4 mb-8">Content</div>

// Direct usage
<div style={{ padding: tokens.spacing[4] }}>Content</div>

// Hook
const { getSpacing } = useTokens();
<div style={{ padding: getSpacing(4) }}>Content</div>
```

### 3. Safe Areas
Handle device notches and home indicators:

```tsx
// Bottom safe area for fixed elements
<div className="fixed bottom-0 safe-bottom">
  <button className="touch-lg">Checkout</button>
</div>

// All safe areas
<div className="safe-all">Full screen content</div>
```

### 4. Mobile Interactions

```tsx
const { mobileInteractions } = useTokens();

// Swipe gesture threshold
if (swipeDistance > mobileInteractions.swipeThreshold) {
  // Handle swipe
}

// Thumb reach zone
<div className="thumb-reach">
  {/* Content limited to comfortable thumb reach */}
</div>
```

## CSS Custom Properties

All tokens are available as CSS variables:

```css
.my-button {
  min-height: var(--touch-target-md);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.mobile-cta {
  position: fixed;
  bottom: var(--safe-area-bottom);
  min-height: var(--touch-target-lg);
}
```

## Tailwind Integration

Add to your `tailwind.config.js`:

```javascript
const tokenConfig = require('@repo/design-system/tailwind-tokens');

module.exports = {
  presets: [tokenConfig],
  // ... your config
};
```

## React Hooks

### useTokens()
Access all tokens and helper functions:

```tsx
function ProductCard() {
  const {
    getTouchTarget,
    getSpacing,
    getSafeArea,
    shadows,
    borderRadius,
    tailwind
  } = useTokens();

  return (
    <div style={{ 
      padding: getSpacing(4),
      boxShadow: shadows.md,
      borderRadius: borderRadius.lg 
    }}>
      <button className={tailwind.touchTargets.md}>
        Add to Cart
      </button>
    </div>
  );
}
```

### useSafeAnimation()
Respect user's motion preferences:

```tsx
function AnimatedCard() {
  const { getSafeDuration } = useSafeAnimation();
  
  return (
    <div style={{
      transition: `transform ${getSafeDuration('fast')}ms ease-out`
    }}>
      Content
    </div>
  );
}
```

## Best Practices

1. **Mobile-First**: Always design for mobile first, then enhance for larger screens
2. **Touch Targets**: Use minimum `md` (44px) for all interactive elements
3. **Safe Areas**: Apply safe area padding to fixed/absolute positioned elements
4. **Thumb Reach**: Keep important actions within the thumb reach zone (60vh)
5. **Consistent Spacing**: Use the 8-point grid for all spacing
6. **Accessible Animations**: Always use `useSafeAnimation()` for motion

## Examples

### Mobile-Optimized Product List

```tsx
function ProductList() {
  const { tailwind, spacing } = useTokens();
  
  return (
    <div className="safe-bottom">
      <div className="grid grid-cols-2 gap-4 p-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md">
            <img src={product.image} className="aspect-square" />
            <div style={{ padding: spacing[3] }}>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">${product.price}</p>
              <button className={tailwind.touchTargets.sm}>
                Quick Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Fixed Bottom CTA

```tsx
function CheckoutBar() {
  const { tailwind } = useTokens();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg safe-bottom">
      <div className="p-4">
        <button className={cn(
          "w-full bg-blue-500 text-white rounded-md font-semibold",
          tailwind.touchTargets.lg
        )}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
```

## TypeScript Support

All tokens are fully typed:

```typescript
import type { 
  TouchTargetSize, 
  SpacingSize,
  AnimationDuration 
} from '@repo/design-system/components';

function getButtonSize(size: TouchTargetSize) {
  return tokens.touchTargets[size];
}
```