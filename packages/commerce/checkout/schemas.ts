import { z } from 'zod';

// Address validation schema
export const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code'),
  country: z.string().default('US'),
  phone: z.string().regex(/^\+?1?\d{10,14}$/, 'Invalid phone number').optional(),
});

// Payment method validation
export const paymentMethodSchema = z.object({
  type: z.enum(['card', 'paypal', 'stripe']),
  token: z.string().optional(), // Stripe token or PayPal payment ID
});

// Simple checkout form schema (flat structure for UI)
export const checkoutFormSchema = z.object({
  // Personal information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  
  // Address fields (flat structure)
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().default('United States'),
  
  // Shipping method
  shippingMethod: z.enum(['standard', 'express', 'overnight']).default('standard'),
  
  // Optional fields
  notes: z.string().optional(),
  saveAddress: z.boolean().default(false),
});

// Complete checkout form schema with nested addresses (for API)
export const completeCheckoutFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  paymentMethod: paymentMethodSchema,
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Order creation schema (for API)
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethodId: z.string(),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().min(0),
  notes: z.string().optional(),
});

// Types inferred from schemas
export type Address = z.infer<typeof addressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type CompleteCheckoutFormData = z.infer<typeof completeCheckoutFormSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;