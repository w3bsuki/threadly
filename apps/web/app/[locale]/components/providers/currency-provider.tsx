'use client';

import {
  type Currency,
  formatCurrency as formatCurrencyUtil,
  getCurrencySymbol,
} from '@repo/content/internationalization/client';
import { getCookie, setCookie } from 'cookies-next';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amount: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    // Load currency from cookie
    const savedCurrency = getCookie('preferredCurrency') as Currency;
    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    setCookie('preferredCurrency', newCurrency, { maxAge: 60 * 60 * 24 * 365 });
  };

  const formatPrice = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const currencySymbol = getCurrencySymbol(currency);

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, formatPrice, currencySymbol }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
