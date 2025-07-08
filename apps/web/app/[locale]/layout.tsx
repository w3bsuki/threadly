import './styles.css';
import { DesignSystemProvider, ServiceWorkerRegistration } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { AnalyticsProvider } from '@repo/analytics';
import { ClerkProvider } from '@repo/auth/client';
import { getDictionary } from '@repo/internationalization';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { PerformanceMonitor } from './components/performance-monitor';
import { CurrencyProvider } from './components/providers/currency-provider';
import { I18nProvider } from './components/providers/i18n-provider';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return (
    <html
      lang={locale}
      className={cn(fonts, 'scroll-smooth')}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 rounded-md z-[100]">
          {dictionary.web.global.accessibility?.skipToMainContent || "Skip to main content"}
        </a>
        <ClerkProvider>
          <AnalyticsProvider>
            <DesignSystemProvider>
              <I18nProvider dictionary={dictionary} locale={locale}>
                <CurrencyProvider>
                  <ServiceWorkerRegistration />
                  <PerformanceMonitor debug={process.env.NODE_ENV === 'development'} />
                  <Header />
                  <main id="main-content" className="min-h-screen">
                    {children}
                  </main>
                  <Footer dictionary={dictionary} />
                </CurrencyProvider>
              </I18nProvider>
            </DesignSystemProvider>
          </AnalyticsProvider>
        </ClerkProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
