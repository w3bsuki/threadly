'use client';

import type { Dictionary } from '@repo/content/internationalization';
import { createContext, type ReactNode, useContext } from 'react';

const TranslationContext = createContext<Dictionary | null>(null);

export function TranslationProvider({
  children,
  dictionary,
}: {
  children: ReactNode;
  dictionary: Dictionary;
}) {
  return (
    <TranslationContext.Provider value={dictionary}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const dictionary = useContext(TranslationContext);

  if (!dictionary) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }

  return dictionary;
}
