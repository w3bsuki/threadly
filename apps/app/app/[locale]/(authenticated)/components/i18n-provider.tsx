'use client';

import type { Dictionary } from '@repo/content/internationalization';
import { createContext, useContext } from 'react';

interface I18nContextValue {
  dictionary: Dictionary;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  children,
  dictionary,
  locale,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: string;
}) {
  return (
    <I18nContext.Provider value={{ dictionary, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Helper hook to get specific translation paths
export function useTranslation() {
  const { dictionary } = useI18n();
  return dictionary;
}
