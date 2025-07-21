/**
 * Currency formatting utilities
 * Provides a general-purpose currency formatting function
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format cents as currency (for compatibility with price.ts)
 * @param cents - The amount in cents
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCentsAsCurrency(
  cents: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return formatCurrency(cents / 100, currency, locale);
}

/**
 * Parse a currency string to a number
 * @param value - The currency string to parse (e.g., "$1,234.56")
 * @returns The numeric value
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid currency format: ${value}`);
  }
  
  return parsed;
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(value);
}