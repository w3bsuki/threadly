import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { createI18nMiddleware } from 'next-international/middleware';
import type { NextRequest } from 'next/server';
import languine from './languine.json';

const locales = [languine.locale.source, ...languine.locale.targets];

const I18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale: 'en',
  urlMappingStrategy: 'rewriteDefault',
  resolveLocaleFromRequest: (request: NextRequest) => {
    try {
      const headers = Object.fromEntries(request.headers.entries());
      const negotiator = new Negotiator({ headers });
      const acceptedLanguages = negotiator.languages();

      // Filter out invalid locales to prevent RangeError
      const validAcceptedLanguages = acceptedLanguages.filter(lang => {
        try {
          Intl.getCanonicalLocales(lang);
          return true;
        } catch {
          return false;
        }
      });

      if (validAcceptedLanguages.length === 0) {
        return 'en';
      }

      const matchedLocale = matchLocale(validAcceptedLanguages, locales, 'en');
      return matchedLocale;
    } catch (error) {
      // Fallback to default locale on any error
      return 'en';
    }
  },
});

export function internationalizationMiddleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

//https://nextjs.org/docs/app/building-your-application/routing/internationalization
//https://github.com/vercel/next.js/tree/canary/examples/i18n-routing
//https://github.com/QuiiBz/next-international
//https://next-international.vercel.app/docs/app-middleware-configuration
