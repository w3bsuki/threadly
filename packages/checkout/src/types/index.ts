import { z } from 'zod';

export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  country: z.string().min(1, 'Country is required'),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  notes: z.string().optional(),
  saveAddress: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  imageUrl?: string;
  sellerId?: string;
}

export interface ShippingOption {
  id: 'standard' | 'express' | 'overnight';
  name: string;
  price: number;
  estimatedDays: string;
  freeThreshold?: number;
}

export interface OrderCosts {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'applePay' | 'googlePay';
  last4?: string;
  brand?: string;
}