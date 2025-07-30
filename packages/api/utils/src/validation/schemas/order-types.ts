import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
  'DISPUTED',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum([
  'STRIPE',
  'PAYPAL',
  'BANK_TRANSFER',
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const ShippingMethodSchema = z.enum([
  'standard',
  'express',
  'overnight',
]);
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;

export const AddressSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1).max(100),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
  phone: z.string().min(1).max(20).optional(),
});

export type Address = z.infer<typeof AddressSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const PaymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  method: PaymentMethodSchema,
  status: PaymentStatusSchema,
  stripePaymentId: z.string().nullable().optional(),
  stripePaymentIntentId: z.string().nullable().optional(),
  stripeRefundId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  productId: z.string(),
  status: OrderStatusSchema,
  quantity: z.number().int().positive().default(1),
  subtotal: z.number().positive(),
  shipping: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().positive(),
  shippingMethod: ShippingMethodSchema,
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  trackingNumber: z.string().nullable().optional(),
  shippedAt: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  payment: PaymentSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
  shippingMethod: ShippingMethodSchema,
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethodId: z.string(),
  notes: z.string().max(1000).optional(),
});

export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderSchema = z.object({
  status: OrderStatusSchema.optional(),
  trackingNumber: z.string().optional(),
  shippedAt: z.date().optional(),
  deliveredAt: z.date().optional(),
  notes: z.string().max(1000).optional(),
});

export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
