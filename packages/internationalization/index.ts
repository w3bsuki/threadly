import 'server-only';
import type en from './dictionaries/en.json';
import languine from './languine.json';

export const locales = [
  languine.locale.source,
  ...languine.locale.targets,
] as const;

export type Dictionary = typeof en;

const dictionaries: Record<string, () => Promise<Dictionary>> =
  Object.fromEntries(
    locales.map((locale) => [
      locale,
      () =>
        import(`./dictionaries/${locale}.json`)
          .then((mod) => mod.default)
          .catch((err) => {
            // Silently fall back to English on error
            return import('./dictionaries/en.json').then((mod) => mod.default);
          }),
    ])
  );

export const getDictionary = async (locale: string): Promise<Dictionary> => {
  const normalizedLocale = locale.split('-')[0];

  if (!locales.includes(normalizedLocale as any)) {
    return dictionaries['en']();
  }

  try {
    return await dictionaries[normalizedLocale]();
  } catch (error) {
    // Silently fall back to English on error
    return dictionaries['en']();
  }
};
