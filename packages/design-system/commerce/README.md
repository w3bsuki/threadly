# @repo/commerce

Core e-commerce functionality for Threadly's C2C fashion marketplace. This package provides cart management, checkout processes, order handling, and product utilities.

## Overview

The commerce package is a central hub for all e-commerce operations in Threadly. It handles:

- **Cart Management**: Add, remove, and update items in the shopping cart
- **Checkout Process**: Complete order flow with payment integration
- **Order Management**: Track and manage orders throughout their lifecycle
- **Product Utilities**: Search, filter, and manage product data
- **Type Safety**: Comprehensive TypeScript definitions for all commerce entities

## Installation

```bash
pnpm add @repo/commerce
```

## Dependencies

This package depends on:
- `@repo/cart` - Cart state management
- `@repo/database` - Database operations
- `@repo/utils` - Utility functions
- `react` - React hooks and components
- `zod` - Runtime validation
- `zustand` - State management

## API Reference

### Cart Module

```typescript
import { 
  useCart, 
  useCartActions, 
  cartStore,
  CartItem,
  CartState 
} from '@repo/commerce/cart';

// Add item to cart
const { addItem } = useCartActions();
await addItem({
  productId: 'prod-123',
  title: 'Vintage Denim Jacket',
  price: 89.99,
  imageUrl: '/images/jacket.jpg',
  sellerId: 'seller-456',
  sellerName: 'Fashion Boutique',
  quantity: 1
});

// Get cart state
const { items, total, itemCount } = useCart();
```

### Checkout Module

```typescript
import { 
  useCheckout, 
  calculateShipping, 
  calculateTax, 
  calculateTotal,
  CheckoutSession,
  ShippingAddress 
} from '@repo/commerce/checkout';

// Calculate order totals
const subtotal = 150.00;
const shipping = calculateShipping(subtotal, 'CA');
const tax = calculateTax(subtotal, 'CA');
const total = calculateTotal(subtotal, tax, shipping);

// Use checkout hook
const { session, updateShippingAddress, processPayment } = useCheckout();

// Update shipping address
await updateShippingAddress({
  name: 'John Doe',
  street: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94102',
  country: 'US'
});
```

### Orders Module

```typescript
import { 
  useOrders, 
  useOrderDetails, 
  Order, 
  OrderStatus 
} from '@repo/commerce/orders';

// Get user orders
const { orders, isLoading } = useOrders();

// Get specific order
const { order } = useOrderDetails('order-123');

// Order status tracking
const orderStatuses: OrderStatus[] = [
  'PENDING',
  'PROCESSING', 
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED'
];
```

### Products Module

```typescript
import { 
  useProducts, 
  useProductSearch, 
  CommerceProduct,
  ProductQuery 
} from '@repo/commerce/products';

// Search products
const query: ProductQuery = {
  search: 'denim jacket',
  category: 'outerwear',
  minPrice: 50,
  maxPrice: 200,
  condition: ['new', 'like-new'],
  sortBy: 'price',
  sortOrder: 'asc'
};

const { products, total, hasMore } = useProductSearch(query);
```

### Utility Functions

```typescript
import { 
  formatPrice, 
  calculateDiscount, 
  validateProduct 
} from '@repo/commerce/utils';

// Format price for display
const formattedPrice = formatPrice(89.99); // "$89.99"

// Calculate discount
const discountedPrice = calculateDiscount(100, 0.15); // 85

// Validate product data
const isValid = validateProduct(productData);
```

## Usage Examples

### Complete Cart to Checkout Flow

```typescript
import { 
  useCart, 
  useCartActions, 
  useCheckout 
} from '@repo/commerce';

function ShoppingCart() {
  const { items, total } = useCart();
  const { removeItem, updateQuantity } = useCartActions();
  const { initiateCheckout } = useCheckout();

  const handleCheckout = async () => {
    try {
      await initiateCheckout({
        items,
        userId: 'user-123'
      });
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div>
      {items.map(item => (
        <div key={item.productId}>
          <h3>{item.title}</h3>
          <p>{formatPrice(item.price)}</p>
          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
            +
          </button>
          <button onClick={() => removeItem(item.productId)}>
            Remove
          </button>
        </div>
      ))}
      <div>Total: {formatPrice(total)}</div>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
}
```

### Product Search and Filtering

```typescript
import { useProductSearch } from '@repo/commerce/products';

function ProductList() {
  const [query, setQuery] = useState<ProductQuery>({
    category: 'clothing',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { products, isLoading, hasMore, loadMore } = useProductSearch(query);

  return (
    <div>
      <SearchFilters onQueryChange={setQuery} />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
          {hasMore && (
            <button onClick={loadMore}>Load More</button>
          )}
        </div>
      )}
    </div>
  );
}
```

### Order Management

```typescript
import { useOrders, useOrderDetails } from '@repo/commerce/orders';

function OrderHistory() {
  const { orders } = useOrders();
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderDetails({ orderId }: { orderId: string }) {
  const { order, updateStatus } = useOrderDetails(orderId);
  
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    await updateStatus(newStatus);
  };
  
  return (
    <div>
      <h2>Order {order.id}</h2>
      <p>Status: {order.status}</p>
      <p>Total: {formatPrice(order.total)}</p>
      {/* Order items and details */}
    </div>
  );
}
```

## Type Definitions

### Core Types

```typescript
interface CommerceProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  condition: string;
  category: string;
  subcategory?: string;
  size?: string;
  color?: string;
  brand?: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CheckoutSession {
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Configuration

### Tax and Shipping Rates

```typescript
// Tax rates by state/region
export const TAX_RATE = {
  CA: 0.0875,
  NY: 0.08,
  TX: 0.0625,
  // ... other states
} as const;

// Shipping rates
export const SHIPPING_RATES = {
  STANDARD: 5.99,
  EXPEDITED: 12.99,
  OVERNIGHT: 24.99,
  FREE_THRESHOLD: 75.00
} as const;
```

## Testing

```bash
# Run commerce package tests
pnpm test packages/commerce

# Run specific test files
pnpm test packages/commerce/cart
pnpm test packages/commerce/checkout
```

## Integration Notes

This package integrates with:
- `@repo/database` for data persistence
- `@repo/payments` for payment processing
- `@repo/real-time` for live updates
- `@repo/validation` for data validation

## Version History

- `1.0.0` - Initial release with cart, checkout, and order management
- Core e-commerce functionality
- TypeScript support
- React hooks integration