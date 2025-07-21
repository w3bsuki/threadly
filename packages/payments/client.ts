// Client-safe payment utilities that can be used in browser

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

// Format price in cents to dollars
export const centsToDollars = (cents: number) => {
  return cents / 100;
};

// Format dollars to cents
export const dollarsToCents = (dollars: number) => {
  return Math.round(dollars * 100);
};