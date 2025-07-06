import type { CartItem } from '@repo/cart';
import type { CheckoutItem, CheckoutSession, ShippingAddress } from '../types';

// Constants for calculations
export const TAX_RATE = 0.0875; // 8.75% default tax rate
export const SHIPPING_RATES = {
  standard: 9.99,
  express: 19.99,
  overnight: 39.99,
};

// Convert cart items to checkout items
export function cartToCheckoutItems(cartItems: CartItem[]): CheckoutItem[] {
  return cartItems.map(item => ({
    productId: item.productId,
    title: item.title,
    price: item.price,
    imageUrl: item.imageUrl,
    sellerId: item.sellerId,
    sellerName: item.sellerName || 'Unknown Seller',
    quantity: item.quantity,
  }));
}

// Calculate checkout totals
export function calculateCheckoutTotals(
  items: CheckoutItem[],
  shippingMethod: keyof typeof SHIPPING_RATES = 'standard',
  taxRate: number = TAX_RATE
): Pick<CheckoutSession, 'subtotal' | 'tax' | 'shipping' | 'total'> {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = SHIPPING_RATES[shippingMethod];
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Validate checkout items availability
export async function validateItemsAvailability(
  items: CheckoutItem[],
  checkAvailability: (productId: string) => Promise<{ available: boolean; quantity: number }>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const item of items) {
    const availability = await checkAvailability(item.productId);
    
    if (!availability.available) {
      errors.push(`${item.title} is no longer available`);
    } else if (availability.quantity < item.quantity) {
      errors.push(`Only ${availability.quantity} of ${item.title} available`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format address for display
export function formatAddress(address: ShippingAddress): string {
  const lines = [
    address.name,
    address.street,
    address.apartment,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country !== 'US' ? address.country : undefined,
  ].filter(Boolean);

  return lines.join('\n');
}

// Create checkout session
export function createCheckoutSession(
  items: CartItem[],
  options?: {
    shippingMethod?: keyof typeof SHIPPING_RATES;
    taxRate?: number;
  }
): CheckoutSession {
  const checkoutItems = cartToCheckoutItems(items);
  const totals = calculateCheckoutTotals(
    checkoutItems,
    options?.shippingMethod,
    options?.taxRate
  );

  return {
    items: checkoutItems,
    ...totals,
  };
}

// Validate and sanitize phone number
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add US country code if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Return with + prefix if not present
  return cleaned.startsWith('1') ? `+${cleaned}` : cleaned;
}

// Group items by seller for split shipments
export function groupItemsBySeller(items: CheckoutItem[]): Record<string, CheckoutItem[]> {
  return items.reduce((groups, item) => {
    const sellerId = item.sellerId;
    if (!groups[sellerId]) {
      groups[sellerId] = [];
    }
    groups[sellerId].push(item);
    return groups;
  }, {} as Record<string, CheckoutItem[]>);
}

// Calculate estimated delivery date
export function estimateDeliveryDate(shippingMethod: keyof typeof SHIPPING_RATES): Date {
  const today = new Date();
  const businessDays = {
    standard: 5,
    express: 2,
    overnight: 1,
  };

  const days = businessDays[shippingMethod];
  const deliveryDate = new Date(today);
  
  // Add business days (skip weekends)
  let daysAdded = 0;
  while (daysAdded < days) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const dayOfWeek = deliveryDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }

  return deliveryDate;
}

// Individual calculation functions for use in hooks
export function calculateShipping(
  shippingAddress?: ShippingAddress,
  shippingMethod: keyof typeof SHIPPING_RATES = 'standard',
  subtotal?: number
): number {
  // Free shipping for orders over $75
  if (subtotal && subtotal >= 75) {
    return 0;
  }
  
  return SHIPPING_RATES[shippingMethod];
}

export function calculateTax(
  subtotal: number,
  shippingAddress?: ShippingAddress,
  taxRate: number = TAX_RATE
): number {
  // Only apply tax for US addresses
  if (shippingAddress && shippingAddress.country !== 'US') {
    return 0;
  }
  
  return Math.round(subtotal * taxRate * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  shipping: number,
  tax: number
): number {
  return Math.round((subtotal + shipping + tax) * 100) / 100;
}