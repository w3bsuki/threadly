// Type definition for Decimal-like objects
interface DecimalLike {
  toString(): string;
  toNumber?(): number;
}

type DecimalValue = DecimalLike | string | number | null | undefined;

/**
 * Safely converts a Prisma Decimal to a JavaScript number
 * @param decimal - The Prisma Decimal value to convert
 * @returns The decimal as a JavaScript number, or 0 if conversion fails
 */
export function decimalToNumber(decimal: DecimalValue): number {
  if (!decimal) return 0;
  
  try {
    // Handle string representation
    if (typeof decimal === 'string') {
      const parsed = parseFloat(decimal);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // Handle direct number
    if (typeof decimal === 'number') {
      return decimal;
    }
    
    // Handle Decimal object
    if (decimal && typeof decimal === 'object') {
      // If it has a toNumber method, use it
      if ('toNumber' in decimal && typeof decimal.toNumber === 'function') {
        return decimal.toNumber();
      }
      
      // Otherwise, try to convert to string first
      if ('toString' in decimal && typeof decimal.toString === 'function') {
        const stringValue = decimal.toString();
        const parsed = parseFloat(stringValue);
        return isNaN(parsed) ? 0 : parsed;
      }
    }
    
    return 0;
  } catch (error) {
    console.warn('Failed to convert Decimal to number:', error);
    return 0;
  }
}

/**
 * Creates a decimal-like object from a value
 * @param value - The number value to convert
 * @returns A decimal-like object
 */
export function numberToDecimal(value: number | string | null | undefined): DecimalLike {
  const numValue = value === null || value === undefined ? 0 : Number(value);
  
  return {
    toString(): string {
      return String(numValue);
    },
    toNumber(): number {
      return numValue;
    }
  };
}

/**
 * Formats a Decimal value as a currency string
 * @param decimal - The Decimal value to format
 * @param currency - The currency code (default: 'USD')
 * @param locale - The locale for formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatDecimalAsCurrency(
  decimal: DecimalValue,
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
  a: DecimalValue,
  b: DecimalValue
): DecimalLike {
  const numA = decimalToNumber(a);
  const numB = decimalToNumber(b);
  
  try {
    const sum = numA + numB;
    return numberToDecimal(sum);
  } catch (error) {
    console.warn('Failed to add decimals:', error);
    return numberToDecimal(0);
  }
}

/**
 * Safely multiplies two Decimal values
 * @param a - First Decimal value
 * @param b - Second Decimal value (multiplier)
 * @returns The product as a new Decimal
 */
export function multiplyDecimals(
  a: DecimalValue,
  b: DecimalValue
): DecimalLike {
  const numA = decimalToNumber(a);
  const numB = decimalToNumber(b);
  
  try {
    const product = numA * numB;
    return numberToDecimal(product);
  } catch (error) {
    console.warn('Failed to multiply decimals:', error);
    return numberToDecimal(0);
  }
}

/**
 * Calculates percentage of a Decimal value
 * @param value - The base Decimal value
 * @param percentage - The percentage as a number (e.g., 5 for 5%)
 * @returns The percentage amount as a new Decimal
 */
export function calculatePercentage(
  value: DecimalValue,
  percentage: number
): DecimalLike {
  const numValue = decimalToNumber(value);
  
  try {
    const result = numValue * (percentage / 100);
    return numberToDecimal(result);
  } catch (error) {
    console.warn('Failed to calculate percentage:', error);
    return numberToDecimal(0);
  }
}

/**
 * Rounds a Decimal to specified decimal places
 * @param decimal - The Decimal value to round
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Rounded Decimal value
 */
export function roundDecimal(
  decimal: DecimalValue,
  decimalPlaces: number = 2
): DecimalLike {
  const numValue = decimalToNumber(decimal);
  
  try {
    const factor = Math.pow(10, decimalPlaces);
    const rounded = Math.round(numValue * factor) / factor;
    return numberToDecimal(rounded);
  } catch (error) {
    console.warn('Failed to round decimal:', error);
    return numberToDecimal(0);
  }
}