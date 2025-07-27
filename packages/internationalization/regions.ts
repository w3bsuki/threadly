export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'BGN' | 'UAH';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'bg' | 'uk';

export interface Region {
  code: string;
  name: string;
  flag: string;
  languages: Language[];
  defaultLanguage: Language;
  currencies: Currency[];
  defaultCurrency: Currency;
  phonePrefix: string;
  // Tax and pricing configuration
  taxRate: number; // Tax rate as decimal (e.g., 0.20 for 20%)
  taxName: string; // e.g., 'VAT', 'Sales Tax'
  displayPricesIncludeTax: boolean; // Whether to show prices with tax included
  // Shipping configuration
  freeShippingThreshold?: number; // In base currency (USD)
  shippingZone: 'domestic' | 'eu' | 'international';
}

export const regions: Record<string, Region> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    languages: ['en', 'es'],
    defaultLanguage: 'en',
    currencies: ['USD'],
    defaultCurrency: 'USD',
    phonePrefix: '+1',
    taxRate: 0.0875, // 8.75% average sales tax
    taxName: 'Sales Tax',
    displayPricesIncludeTax: false,
    freeShippingThreshold: 75,
    shippingZone: 'domestic',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    languages: ['en'],
    defaultLanguage: 'en',
    currencies: ['GBP', 'EUR'],
    defaultCurrency: 'GBP',
    phonePrefix: '+44',
    taxRate: 0.20, // 20% VAT
    taxName: 'VAT',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 50,
    shippingZone: 'eu',
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    languages: ['es', 'en'],
    defaultLanguage: 'es',
    currencies: ['EUR'],
    defaultCurrency: 'EUR',
    phonePrefix: '+34',
    taxRate: 0.21, // 21% VAT
    taxName: 'IVA',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 60,
    shippingZone: 'eu',
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    languages: ['fr', 'en'],
    defaultLanguage: 'fr',
    currencies: ['EUR'],
    defaultCurrency: 'EUR',
    phonePrefix: '+33',
    taxRate: 0.20, // 20% VAT
    taxName: 'TVA',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 60,
    shippingZone: 'eu',
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    languages: ['de', 'en'],
    defaultLanguage: 'de',
    currencies: ['EUR'],
    defaultCurrency: 'EUR',
    phonePrefix: '+49',
    taxRate: 0.19, // 19% VAT
    taxName: 'MwSt',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 60,
    shippingZone: 'eu',
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    languages: ['pt', 'en'],
    defaultLanguage: 'pt',
    currencies: ['EUR'],
    defaultCurrency: 'EUR',
    phonePrefix: '+351',
    taxRate: 0.23, // 23% VAT
    taxName: 'IVA',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 60,
    shippingZone: 'eu',
  },
  BG: {
    code: 'BG',
    name: 'Bulgaria',
    flag: '🇧🇬',
    languages: ['bg', 'en'],
    defaultLanguage: 'bg',
    currencies: ['BGN', 'EUR'],
    defaultCurrency: 'BGN',
    phonePrefix: '+359',
    taxRate: 0.20, // 20% VAT
    taxName: 'ДДС',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 100, // ~50 EUR in BGN
    shippingZone: 'eu',
  },
  UA: {
    code: 'UA',
    name: 'Ukraine',
    flag: '🇺🇦',
    languages: ['uk', 'en'],
    defaultLanguage: 'uk',
    currencies: ['UAH', 'EUR', 'USD'],
    defaultCurrency: 'UAH',
    phonePrefix: '+380',
    taxRate: 0.20, // 20% VAT
    taxName: 'ПДВ',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 2000, // ~50 EUR in UAH
    shippingZone: 'international',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    languages: ['en', 'fr'],
    defaultLanguage: 'en',
    currencies: ['CAD', 'USD'],
    defaultCurrency: 'CAD',
    phonePrefix: '+1',
    taxRate: 0.13, // Average GST/HST
    taxName: 'GST/HST',
    displayPricesIncludeTax: false,
    freeShippingThreshold: 100,
    shippingZone: 'international',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    languages: ['en'],
    defaultLanguage: 'en',
    currencies: ['AUD'],
    defaultCurrency: 'AUD',
    phonePrefix: '+61',
    taxRate: 0.10, // 10% GST
    taxName: 'GST',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 100,
    shippingZone: 'international',
  },
  CN: {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    languages: ['zh', 'en'],
    defaultLanguage: 'zh',
    currencies: ['USD', 'EUR'],
    defaultCurrency: 'USD',
    phonePrefix: '+86',
    taxRate: 0.13, // 13% VAT
    taxName: '增值税',
    displayPricesIncludeTax: true,
    freeShippingThreshold: 100,
    shippingZone: 'international',
  },
};

export const getRegionByCountryCode = (code: string): Region | undefined => {
  return regions[code.toUpperCase()];
};

export const getDefaultRegion = (): Region => {
  return regions.BG as Region;
};

export const detectRegionFromLocale = (locale: string): Region => {
  // Map locales to their primary regions
  const localeToRegion: Record<string, string> = {
    en: 'US',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    pt: 'PT',
    zh: 'CN',
    bg: 'BG',
    uk: 'UA',
  };

  const normalizedLocale = locale.split('-')[0];
  const regionCode = normalizedLocale ? localeToRegion[normalizedLocale] : undefined;
  
  if (regionCode && regions[regionCode]) {
    return regions[regionCode] as Region;
  }
  return getDefaultRegion();
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    BGN: 'лв',
    UAH: '₴',
  };
  
  return symbols[currency] || currency;
};

export const formatCurrency = (
  amount: number,
  currency: Currency,
  locale?: string
): string => {
  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for currencies not supported by Intl
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Tax calculation utilities
export const calculateTax = (
  amount: number,
  region: Region
): number => {
  return Math.round(amount * region.taxRate * 100) / 100;
};

export const calculatePriceWithTax = (
  amount: number,
  region: Region
): number => {
  const tax = calculateTax(amount, region);
  return Math.round((amount + tax) * 100) / 100;
};

export const extractPriceWithoutTax = (
  amountWithTax: number,
  region: Region
): number => {
  // For regions that display prices with tax included
  const priceWithoutTax = amountWithTax / (1 + region.taxRate);
  return Math.round(priceWithoutTax * 100) / 100;
};

// Price display utilities
export const formatPriceForDisplay = (
  amount: number,
  region: Region,
  currency: Currency,
  locale?: string
): { displayPrice: string; taxInfo: string } => {
  let displayAmount = amount;
  let taxInfo = '';

  if (region.displayPricesIncludeTax) {
    displayAmount = calculatePriceWithTax(amount, region);
    taxInfo = `incl. ${region.taxName}`;
  } else {
    taxInfo = `excl. ${region.taxName}`;
  }

  return {
    displayPrice: formatCurrency(displayAmount, currency, locale),
    taxInfo,
  };
};

// Shipping rate calculation
export const calculateShippingRate = (
  subtotal: number,
  region: Region,
  shippingMethod: 'standard' | 'express' | 'overnight' = 'standard'
): number => {
  // Check if eligible for free shipping
  if (region.freeShippingThreshold && subtotal >= region.freeShippingThreshold) {
    return 0;
  }

  // Base shipping rates (in USD)
  const baseRates = {
    standard: { domestic: 9.99, eu: 14.99, international: 24.99 },
    express: { domestic: 19.99, eu: 29.99, international: 49.99 },
    overnight: { domestic: 39.99, eu: 59.99, international: 99.99 },
  };

  return baseRates[shippingMethod][region.shippingZone];
};

// Get tax-inclusive price for checkout
export const getCheckoutPrice = (
  basePrice: number,
  region: Region
): { subtotal: number; tax: number; total: number } => {
  const tax = calculateTax(basePrice, region);
  
  return {
    subtotal: basePrice,
    tax,
    total: basePrice + tax,
  };
};

// Format price breakdown for invoice/receipt
export const formatPriceBreakdown = (
  basePrice: number,
  region: Region,
  currency: Currency,
  locale?: string
): { 
  subtotal: string; 
  tax: string; 
  taxLabel: string;
  total: string;
} => {
  const { subtotal, tax, total } = getCheckoutPrice(basePrice, region);
  
  return {
    subtotal: formatCurrency(subtotal, currency, locale),
    tax: formatCurrency(tax, currency, locale),
    taxLabel: `${region.taxName} (${(region.taxRate * 100).toFixed(0)}%)`,
    total: formatCurrency(total, currency, locale),
  };
};