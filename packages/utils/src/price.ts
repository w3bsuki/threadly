/**
 * Price utility functions for consistent handling of monetary values
 * All prices are stored in cents (integers) in the database
 */

/**
 * Format cents to display price (e.g., 1999 → $19.99)
 */
export function formatPrice(cents: number, currency: string = 'USD', locale?: string): string {
  const dollars = cents / 100;
  
  // Map currency to appropriate locale if not provided
  const defaultLocales: Record<string, string> = {
    USD: 'en-US',
    EUR: 'en-GB',
    GBP: 'en-GB',
    CAD: 'en-CA',
    AUD: 'en-AU',
    BGN: 'bg-BG',
    UAH: 'uk-UA',
  };
  
  const formatLocale = locale || defaultLocales[currency] || 'en-US';
  
  try {
    return new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars);
  } catch (error) {
    // Fallback for unsupported currency/locale combinations
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      BGN: 'лв',
      UAH: '₴',
    };
    const symbol = symbols[currency] || currency;
    return `${symbol}${dollars.toFixed(2)}`;
  }
}

/**
 * Convert dollars to cents for storage (e.g., 19.99 → 1999)
 */
export function dollarsToStorageCents(dollars: number): number {
  // Round to avoid floating point precision issues
  return Math.round(dollars * 100);
}

/**
 * Convert database dollars to cents for Stripe (e.g., 19.99 → 1999)
 * Note: This is for legacy data that stores prices as dollars
 */
export function databaseDollarsToStripeCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars for forms (e.g., 1999 → 19.99)
 */
export function centsToDisplayDollars(cents: number): number {
  return cents / 100;
}

/**
 * Parse user input to cents (handles various formats)
 * Examples: "$19.99" → 1999, "19.99" → 1999, "20" → 2000
 */
export function parseUserPriceToCents(input: string | number): number {
  if (typeof input === 'number') {
    return dollarsToStorageCents(input);
  }
  
  // Remove currency symbols and whitespace
  const cleaned = input.replace(/[$,\s]/g, '');
  const dollars = parseFloat(cleaned);
  
  if (isNaN(dollars)) {
    throw new Error('Invalid price format');
  }
  
  return dollarsToStorageCents(dollars);
}

/**
 * Validate price is within acceptable range
 */
export function isPriceValid(cents: number): boolean {
  return cents >= 1 && cents <= 99999999; // $0.01 to $999,999.99
}

/**
 * Get display price from database value
 * Handles both legacy (dollars) and new (cents) formats
 * @deprecated Use formatPrice with proper cents values instead
 */
export function formatDatabasePrice(value: number, isLegacyDollars: boolean = true, currency: string = 'USD'): string {
  const cents = isLegacyDollars ? databaseDollarsToStripeCents(value) : value;
  return formatPrice(cents, currency);
}