import './styles.css';
import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import {
  DesignSystemProvider,
  ServiceWorkerRegistration,
} from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { getDictionary } from '@repo/internationalization';
import { ErrorBoundary } from '@repo/utils/src/error-boundary';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { UnifiedBottomNav } from '../../components/navigation/unified-bottom-nav';
import { PerformanceMonitor } from './components/performance-monitor';
import { CurrencyProvider } from './components/providers/currency-provider';
import { I18nProvider } from './components/providers/i18n-provider';
import { PromotionalBanner } from './products/components/promotional-banner';

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
        <link href="/manifest.json" rel="manifest" />
        <meta content="#000000" name="theme-color" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
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
                  <UnifiedBottomNav />
                </CurrencyProvider>
              </I18nProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </DesignSystemProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
