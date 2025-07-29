import './styles.css';
import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import {
  DesignSystemProvider,
  ServiceWorkerRegistration,
} from '@repo/ui';
import { fonts } from '@repo/ui/lib/fonts';
import { cn } from '@repo/ui/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { getDictionary } from '@repo/internationalization';
import { ErrorBoundary } from '@repo/utils/src/error-boundary';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { MobileBottomNav } from './components/mobile-bottom-nav';
import { PerformanceMonitor } from './components/performance-monitor';
import { CurrencyProvider } from './components/providers/currency-provider';
import { I18nProvider } from './components/providers/i18n-provider';
import { PromotionalBanner } from './products/components/promotional-banner';
import { WebTRPCProvider } from '../../lib/trpc';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return (
    <html
      className={cn(fonts, 'scroll-smooth')}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link href="/manifest.json" rel="manifest" />
        <meta content="#000000" name="theme-color" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta name="apple-mobile-web-app-title" content="Threadly" />
      </head>
      <body>
        {/* Skip to main content link for accessibility */}
        <a
          className="sr-only z-[100] rounded-[var(--radius-md)] bg-foreground px-4 py-2 text-background focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
          href="#main-content"
        >
          {dictionary.web.global.accessibility?.skipToMainContent ||
            'Skip to main content'}
        </a>
        <DesignSystemProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <WebTRPCProvider>
                <I18nProvider dictionary={dictionary} locale={locale}>
                  <CurrencyProvider>
                  <ServiceWorkerRegistration />
                  <PerformanceMonitor
                    debug={process.env.NODE_ENV === 'development'}
                  />

                  <PromotionalBanner />
                  <Header />
                  <main
                    className="min-h-screen pb-16 md:pb-0"
                    id="main-content"
                  >
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </main>
                  <Footer dictionary={dictionary} />
                  <MobileBottomNav />
                  </CurrencyProvider>
                </I18nProvider>
              </WebTRPCProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </DesignSystemProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
