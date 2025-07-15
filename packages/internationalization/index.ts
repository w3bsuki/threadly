import 'server-only';
import type en from './dictionaries/en.json';

export const locales = ['bg', 'en', 'uk'] as const;
export type Locale = typeof locales[number];

export type Dictionary = typeof en;

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const normalizedLocale = locale.split('-')[0];

  // Only load the requested locale
  try {
    switch (normalizedLocale) {
      case 'bg':
        return (await import('./dictionaries/bg.json')).default;
      case 'uk':
        return (await import('./dictionaries/uk.json')).default;
      case 'en':
      default:
        return (await import('./dictionaries/en.json')).default;
    }
  } catch (error) {
    // Fall back to English on error
    return (await import('./dictionaries/en.json')).default;
  }
};

// Export regions functionality
export * from './regions';
