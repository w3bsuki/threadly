# Cart Components

Shared cart UI components for the Threadly marketplace that support both animated (web) and standard (app) approaches.

## Components

### CartItem
Display individual cart items with quantity controls, product details, and remove functionality.

```tsx
import { CartItem } from '@repo/design-system/components';

<CartItem
  id="123"
  title="Vintage Leather Jacket"
  price={89.99}
  originalPrice={120.00}
  quantity={1}
  imageUrl="/images/jacket.jpg"
  size="M"
  color="Brown"
  condition="Excellent"
  brand="Designer Brand"
  seller="John's Vintage Shop"
  onQuantityChange={(id, qty) => updateQuantity(id, qty)}
  onRemove={(id) => removeFromCart(id)}
  enableAnimations={true} // Enable framer-motion style animations
  variant="default" // or "compact" for smaller displays
/>
```

### CartSummary
Show order summary with subtotal, discounts, shipping, and checkout button.

```tsx
import { CartSummary } from '@repo/design-system/components';

<CartSummary
  subtotal={150.00}
  discount={15.00}
  shipping={5.99}
  tax={12.50}
  total={153.49}
  itemCount={3}
  onCheckout={() => router.push('/checkout')}
  isCheckoutLoading={false}
  promoCode="SAVE10"
  promoDiscount={10.00}
  estimatedDelivery="3-5 business days"
  variant="default" // "compact" | "sidebar"
  enableAnimations={true}
/>
```

### CartEmpty
Empty cart state with call-to-action.

```tsx
import { CartEmpty } from '@repo/design-system/components';

<CartEmpty
  title="Your cart is empty"
  description="Start shopping to add items to your cart"
  actionText="Browse Products"
  onAction={() => router.push('/products')}
  showSuggestions={true}
  variant="illustrated" // "default" | "minimal" | "illustrated"
  enableAnimations={true}
/>
```

### CartQuantitySelector
Standalone quantity selector for flexible use.

```tsx
import { CartQuantitySelector } from '@repo/design-system/components';

<CartQuantitySelector
  value={quantity}
  onChange={setQuantity}
  min={1}
  max={10}
  size="md" // "sm" | "md" | "lg"
  variant="default" // "inline" | "compact"
  showInput={true}
  enableAnimations={true}
/>
```

## Props

All components support:
- `enableAnimations`: Enable smooth transitions and micro-interactions
- `className`: Additional CSS classes for customization
- TypeScript strict mode compliance
- Light and dark theme support
- Mobile responsive design

## Styling

Components use the design system's existing tokens and utilities:
- Colors from OKLCH color space
- Consistent spacing (4px grid)
- Touch-friendly targets (36px minimum)
- Smooth animations when enabled