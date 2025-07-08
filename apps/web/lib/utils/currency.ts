import { formatPrice, databaseDollarsToStripeCents } from '@repo/utils/price';
import { getCookie } from 'cookies-next';
import type { Currency } from '@repo/internationalization/client';

/**
 * Format price from database (stored as dollars) for display
 * @param price - Price in dollars from database (e.g., 29.99)
 * @param currency - Optional currency override (defaults to user's preferred currency)
 * @returns Formatted price string (e.g., "$29.99")
 */
export function formatProductPrice(price: number, currency?: string): string {
  // Get user's preferred currency from cookie if not provided
  const preferredCurrency = currency || (getCookie('preferredCurrency') as Currency) || 'USD';
  
  // Convert database dollars to cents, then format
  const cents = databaseDollarsToStripeCents(price);
  return formatPrice(cents, preferredCurrency);
}

/**
 * Format price for consistent use across the web app
 * This is a convenience wrapper that handles our database format
 */
export const formatCurrency = formatProductPrice;