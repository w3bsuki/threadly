export function getLocaleConfig(locale: string) {
  const localeMap: Record<string, { currency: string; locale: string }> = {
    en: { currency: 'USD', locale: 'en-US' },
    bg: { currency: 'BGN', locale: 'bg-BG' },
    uk: { currency: 'UAH', locale: 'uk-UA' },
  };

  return localeMap[locale] || localeMap.en;
}

export function formatCurrency(amount: number, locale: string): string {
  const config = getLocaleConfig(locale);

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}

export function formatNumber(value: number, locale: string): string {
  const config = getLocaleConfig(locale);

  return new Intl.NumberFormat(config.locale).format(value);
}

export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const config = getLocaleConfig(locale);

  return new Intl.DateTimeFormat(config.locale, options).format(date);
}

export function formatRelativeTime(
  date: Date | string | number,
  locale: string
): string {
  const config = getLocaleConfig(locale);
  const rtf = new Intl.RelativeTimeFormat(config.locale, { numeric: 'auto' });

  // Ensure date is a Date object
  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    // Fallback to current date if invalid
    dateObj = new Date();
  }

  const daysDiff = Math.floor(
    (dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) return 'today';
  if (daysDiff === -1) return 'yesterday';
  if (daysDiff === 1) return 'tomorrow';

  if (Math.abs(daysDiff) < 7) {
    return rtf.format(daysDiff, 'day');
  }
  if (Math.abs(daysDiff) < 30) {
    return rtf.format(Math.floor(daysDiff / 7), 'week');
  }
  if (Math.abs(daysDiff) < 365) {
    return rtf.format(Math.floor(daysDiff / 30), 'month');
  }
  return rtf.format(Math.floor(daysDiff / 365), 'year');
}
