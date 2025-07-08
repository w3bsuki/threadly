import { formatPrice, databaseDollarsToStripeCents } from '@repo/utils/price';
import { getCookie } from 'cookies-next';
import type { Currency, Language } from '@repo/internationalization/client';

/**
 * Format price from database (stored as dollars) for display
 * @param price - Price in dollars from database (e.g., 29.99)
 * @param currency - Optional currency override (defaults to user's preferred currency)
 * @param locale - Optional locale override (defaults to user's preferred language)
 * @returns Formatted price string (e.g., "$29.99", "85,00 лв")
 */
export function formatProductPrice(price: number, currency?: string, locale?: string): string {
  // Get user's preferred currency from cookie if not provided
  const preferredCurrency = currency || (getCookie('preferredCurrency') as Currency) || 'USD';
  const preferredLanguage = locale || (getCookie('preferredLanguage') as Language) || 'en';
  
  // Map language codes to full locales
  const localeMap: Record<string, string> = {
    en: 'en-US',
    bg: 'bg-BG',
    uk: 'uk-UA',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    pt: 'pt-PT',
    zh: 'zh-CN',
  };
  
  const fullLocale = localeMap[preferredLanguage] || 'en-US';
  
  // Convert database dollars to cents, then format
  const cents = databaseDollarsToStripeCents(price);
  return formatPrice(cents, preferredCurrency, fullLocale);
}

/**
 * Format price for consistent use across the web app
 * This is a convenience wrapper that handles our database format
 */
export const formatCurrency = formatProductPrice;