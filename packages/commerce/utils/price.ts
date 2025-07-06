/**
 * Commerce Price Utilities
 * 
 * This module provides safe, consistent price handling utilities that work
 * in both server and client environments. It handles Prisma Decimal conversion
 * issues and provides standardized price formatting for the marketplace.
 * 
 * Following Next-Forge best practices for type safety and environment compatibility.
 */

// Type definitions for safe Decimal handling
export type PriceInput = number | string | null | undefined | {
  toNumber?: () => number;
  toString?: () => string;
};

/**
 * Safely converts any price input to a JavaScript number
 * Handles Prisma Decimal, strings, numbers, and null/undefined values
 * 
 * @param value - The price value to convert (Decimal, number, string, etc.)
 * @returns Safe number representation, defaults to 0 for invalid inputs
 */
export function toNumber(value: PriceInput): number {
  try {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return 0;
    }

    // Handle direct numbers
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }

    // Handle string values
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Handle Prisma Decimal objects (server-side)
    if (value && typeof value === 'object') {
      // Try toNumber method first (Prisma Decimal)
      if ('toNumber' in value && typeof value.toNumber === 'function') {
        return value.toNumber();
      }

      // Fallback to toString
      if ('toString' in value && typeof value.toString === 'function') {
        const stringValue = value.toString();
        const parsed = parseFloat(stringValue);
        return isNaN(parsed) ? 0 : parsed;
      }
    }

    // Last resort: try to convert to string then number
    const stringValue = String(value);
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;

  } catch (error) {
    // Safe fallback for any conversion errors
    console.warn('Price conversion failed:', error);
    return 0;
  }
}

/**
 * Formats a price value as a currency string
 * 
 * @param value - The price value to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted currency string (e.g., "$19.99")
 */
export function formatPrice(
  value: PriceInput,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const numericValue = toNumber(value);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch (error) {
    // Fallback formatting if Intl fails
    console.warn('Currency formatting failed, using fallback:', error);
    return `${currency} ${numericValue.toFixed(2)}`;
  }
}

/**
 * Formats a price value as a simple decimal string
 * 
 * @param value - The price value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted decimal string (e.g., "19.99")
 */
export function formatDecimal(value: PriceInput, decimals: number = 2): string {
  const numericValue = toNumber(value);
  return numericValue.toFixed(decimals);
}

/**
 * Converts dollars to cents for payment processing
 * 
 * @param value - Dollar amount
 * @returns Amount in cents (integer)
 */
export function toCents(value: PriceInput): number {
  const dollars = toNumber(value);
  return Math.round(dollars * 100);
}

/**
 * Converts cents to dollars
 * 
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function toDollars(cents: number): number {
  return cents / 100;
}

/**
 * Validates if a price value is valid for commerce
 * 
 * @param value - Price value to validate
 * @param min - Minimum allowed value (default: 0.01)
 * @param max - Maximum allowed value (default: 999999.99)
 * @returns true if price is valid
 */
export function isValidPrice(
  value: PriceInput,
  min: number = 0.01,
  max: number = 999999.99
): boolean {
  const numericValue = toNumber(value);
  return numericValue >= min && numericValue <= max && !isNaN(numericValue);
}

/**
 * Calculates percentage of a price value
 * 
 * @param value - Base price value
 * @param percentage - Percentage to calculate (e.g., 5 for 5%)
 * @returns Calculated percentage amount
 */
export function calculatePercentage(value: PriceInput, percentage: number): number {
  const numericValue = toNumber(value);
  return numericValue * (percentage / 100);
}

/**
 * Adds tax to a price value
 * 
 * @param value - Base price value
 * @param taxRate - Tax rate as percentage (e.g., 8.75 for 8.75%)
 * @returns Price with tax added
 */
export function addTax(value: PriceInput, taxRate: number): number {
  const numericValue = toNumber(value);
  const tax = calculatePercentage(numericValue, taxRate);
  return numericValue + tax;
}

/**
 * Calculates discount amount
 * 
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage (0-100)
 */
export function calculateDiscountPercentage(
  originalPrice: PriceInput,
  discountedPrice: PriceInput
): number {
  const original = toNumber(originalPrice);
  const discounted = toNumber(discountedPrice);
  
  if (original <= 0 || discounted >= original) {
    return 0;
  }
  
  return Math.round(((original - discounted) / original) * 100);
}

/**
 * Safely compares two price values
 * 
 * @param a - First price value
 * @param b - Second price value
 * @returns Comparison result (-1, 0, 1)
 */
export function comparePrice(a: PriceInput, b: PriceInput): number {
  const numA = toNumber(a);
  const numB = toNumber(b);
  
  if (numA < numB) return -1;
  if (numA > numB) return 1;
  return 0;
}

/**
 * Rounds a price to the nearest cent
 * 
 * @param value - Price value to round
 * @returns Rounded price value
 */
export function roundToCents(value: PriceInput): number {
  const numericValue = toNumber(value);
  return Math.round(numericValue * 100) / 100;
}