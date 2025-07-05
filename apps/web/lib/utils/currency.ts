import { formatPrice, databaseDollarsToStripeCents } from '@repo/utils/src/price';

/**
 * Format price from database (stored as dollars) for display
 * @param price - Price in dollars from database (e.g., 29.99)
 * @returns Formatted price string (e.g., "$29.99")
 */
export function formatProductPrice(price: number): string {
  // Convert database dollars to cents, then format
  const cents = databaseDollarsToStripeCents(price);
  return formatPrice(cents);
}

/**
 * Format price for consistent use across the web app
 * This is a convenience wrapper that handles our database format
 */
export const formatCurrency = formatProductPrice;