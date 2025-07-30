import 'server-only';
import Stripe from 'stripe';
import { keys } from './keys';

const env = keys();
const stripeSecretKey = env.STRIPE_SECRET_KEY;

// Export a properly configured Stripe instance
export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// Helper to check if Stripe is configured
export const isStripeConfigured = () => {
  return Boolean(stripeSecretKey);
};

// Helper to format currency amounts
export const formatCurrency = (amount: number, currency = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
};

// Calculate platform fee (5%)
export const calculatePlatformFee = (amount: number) => {
  return Math.round(amount * 0.05);
};

// Calculate seller payout (95%)
export const calculateSellerPayout = (amount: number) => {
  return amount - calculatePlatformFee(amount);
};

export type { Stripe } from 'stripe';
