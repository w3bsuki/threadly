/**
 * Currency Utilities for International Marketplace
 * 
 * Provides currency conversion, formatting, and validation utilities
 * for the Bulgarian market and international expansion.
 */

import { formatPrice, toNumber, type PriceInput } from './price';

// Supported currencies for the marketplace
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

/**
 * Formats price with appropriate currency symbol and locale
 * 
 * @param value - Price value to format
 * @param currency - Currency code
 * @param locale - Locale for formatting
 * @returns Formatted price string
 */
export function formatCurrency(
  value: PriceInput,
  currency: SupportedCurrency = 'USD',
  locale?: string
): string {
  // Determine appropriate locale based on currency
  const defaultLocale = getLocaleForCurrency(currency);
  return formatPrice(value, currency, locale || defaultLocale);
}

/**
 * Gets the appropriate locale for a currency
 * 
 * @param currency - Currency code
 * @returns Locale string
 */
export function getLocaleForCurrency(currency: SupportedCurrency): string {
  const localeMap: Record<SupportedCurrency, string> = {
    USD: 'en-US',
    EUR: 'de-DE', // German formatting for EUR is widely accepted
    BGN: 'bg-BG',
    GBP: 'en-GB',
  };
  
  return localeMap[currency] || 'en-US';
}

/**
 * Validates if a currency is supported
 * 
 * @param currency - Currency code to validate
 * @returns true if currency is supported
 */
export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return currency in SUPPORTED_CURRENCIES;
}

/**
 * Gets currency information
 * 
 * @param currency - Currency code
 * @returns Currency information object
 */
export function getCurrencyInfo(currency: SupportedCurrency) {
  return SUPPORTED_CURRENCIES[currency];
}

/**
 * Converts price to display format for Bulgarian users
 * Includes both BGN and USD for transparency
 * 
 * @param value - Price value in USD
 * @param usdToBgnRate - Current exchange rate (USD to BGN)
 * @returns Formatted price string with both currencies
 */
export function formatBulgarianPrice(
  value: PriceInput,
  usdToBgnRate: number = 1.8 // Approximate rate, should be dynamic
): string {
  const usdPrice = toNumber(value);
  const bgnPrice = usdPrice * usdToBgnRate;
  
  const usdFormatted = formatCurrency(usdPrice, 'USD');
  const bgnFormatted = formatCurrency(bgnPrice, 'BGN');
  
  return `${bgnFormatted} (${usdFormatted})`;
}

/**
 * Formats price range (e.g., for filtering)
 * 
 * @param min - Minimum price
 * @param max - Maximum price
 * @param currency - Currency code
 * @returns Formatted price range string
 */
export function formatPriceRange(
  min: PriceInput,
  max: PriceInput,
  currency: SupportedCurrency = 'USD'
): string {
  const minFormatted = formatCurrency(min, currency);
  const maxFormatted = formatCurrency(max, currency);
  
  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Parses a currency string back to a number
 * Handles various currency formats
 * 
 * @param currencyString - Currency string to parse (e.g., "$19.99", "19,99 €")
 * @returns Numeric value
 */
export function parseCurrencyString(currencyString: string): number {
  try {
    // Remove currency symbols, spaces, and convert commas to dots
    const cleaned = currencyString
      .replace(/[^\d,.-]/g, '') // Remove all non-numeric chars except commas, dots, dashes
      .replace(/,(\d{2})$/, '.$1') // Convert comma decimal separator to dot (European format)
      .replace(/,/g, ''); // Remove thousand separators
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.warn('Failed to parse currency string:', currencyString, error);
    return 0;
  }
}

/**
 * Gets minimum viable price for a currency
 * (to avoid pricing items too low)
 * 
 * @param currency - Currency code
 * @returns Minimum price in the currency
 */
export function getMinimumPrice(currency: SupportedCurrency): number {
  const minimums: Record<SupportedCurrency, number> = {
    USD: 0.99,  // $0.99 minimum
    EUR: 0.99,  // €0.99 minimum
    BGN: 1.99,  // 1.99 лв minimum
    GBP: 0.99,  // £0.99 minimum
  };
  
  return minimums[currency];
}

/**
 * Formats price for payment processing
 * Some payment providers require specific formats
 * 
 * @param value - Price value
 * @param provider - Payment provider ('stripe', 'paypal', etc.)
 * @returns Formatted price for payment provider
 */
export function formatForPaymentProvider(
  value: PriceInput,
  provider: 'stripe' | 'paypal' | 'revolut' = 'stripe'
): number {
  const numericValue = toNumber(value);
  
  switch (provider) {
    case 'stripe':
      // Stripe requires amounts in cents
      return Math.round(numericValue * 100);
    
    case 'paypal':
      // PayPal accepts decimal amounts
      return Math.round(numericValue * 100) / 100;
    
    case 'revolut':
      // Revolut Business API requires amounts in minor units (cents)
      return Math.round(numericValue * 100);
    
    default:
      return numericValue;
  }
}