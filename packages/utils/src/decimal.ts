import { Decimal } from '@prisma/client/runtime/library';

/**
 * Safely converts a Prisma Decimal to a JavaScript number
 * @param decimal - The Prisma Decimal value to convert
 * @returns The decimal as a JavaScript number, or 0 if conversion fails
 */
export function decimalToNumber(decimal: Decimal | null | undefined): number {
  if (!decimal) return 0;
  
  try {
    // Handle string representation
    if (typeof decimal === 'string') {
      const parsed = parseFloat(decimal);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Handle Decimal object
    if (decimal && typeof decimal.toNumber === 'function') {
      return decimal.toNumber();
    }
    
    // Handle direct number
    if (typeof decimal === 'number') {
      return decimal;
    }
    
    // Try to convert to string first, then to number
    const stringValue = decimal.toString();
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.warn('Failed to convert Decimal to number:', error);
    return 0;
  }
}

/**
 * Safely converts a JavaScript number to a Prisma Decimal
 * @param value - The number value to convert
 * @returns A new Decimal instance
 */
export function numberToDecimal(value: number | string | null | undefined): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0);
  }
  
  try {
    return new Decimal(value);
  } catch (error) {
    console.warn('Failed to convert to Decimal:', error);
    return new Decimal(0);
  }
}

/**
 * Formats a Decimal value as a currency string
 * @param decimal - The Decimal value to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatDecimalAsCurrency(
  decimal: Decimal | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  const number = decimalToNumber(decimal);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  } catch (error) {
    console.warn('Failed to format decimal as currency:', error);
    return `${currency} ${number.toFixed(2)}`;
  }
}

/**
 * Safely adds two Decimal values
 * @param a - First Decimal value
 * @param b - Second Decimal value
 * @returns The sum as a new Decimal
 */
export function addDecimals(
  a: Decimal | null | undefined,
  b: Decimal | null | undefined
): Decimal {
  const decimalA = a ? new Decimal(a) : new Decimal(0);
  const decimalB = b ? new Decimal(b) : new Decimal(0);
  
  try {
    return decimalA.add(decimalB);
  } catch (error) {
    console.warn('Failed to add decimals:', error);
    return new Decimal(0);
  }
}

/**
 * Safely multiplies two Decimal values
 * @param a - First Decimal value
 * @param b - Second Decimal value (multiplier)
 * @returns The product as a new Decimal
 */
export function multiplyDecimals(
  a: Decimal | null | undefined,
  b: Decimal | null | undefined
): Decimal {
  const decimalA = a ? new Decimal(a) : new Decimal(0);
  const decimalB = b ? new Decimal(b) : new Decimal(1);
  
  try {
    return decimalA.mul(decimalB);
  } catch (error) {
    console.warn('Failed to multiply decimals:', error);
    return new Decimal(0);
  }
}

/**
 * Calculates percentage of a Decimal value
 * @param value - The base Decimal value
 * @param percentage - The percentage as a number (e.g., 5 for 5%)
 * @returns The percentage amount as a new Decimal
 */
export function calculatePercentage(
  value: Decimal | null | undefined,
  percentage: number
): Decimal {
  const decimal = value ? new Decimal(value) : new Decimal(0);
  const percentageDecimal = new Decimal(percentage).div(100);
  
  try {
    return decimal.mul(percentageDecimal);
  } catch (error) {
    console.warn('Failed to calculate percentage:', error);
    return new Decimal(0);
  }
}

/**
 * Rounds a Decimal to specified decimal places
 * @param decimal - The Decimal value to round
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Rounded Decimal value
 */
export function roundDecimal(
  decimal: Decimal | null | undefined,
  decimalPlaces: number = 2
): Decimal {
  if (!decimal) return new Decimal(0);
  
  try {
    return new Decimal(decimal).toDecimalPlaces(decimalPlaces);
  } catch (error) {
    console.warn('Failed to round decimal:', error);
    return new Decimal(0);
  }
}