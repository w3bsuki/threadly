import './styles.css';
import { DesignSystemProvider, ServiceWorkerRegistration } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { AnalyticsProvider } from '@repo/analytics';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => {
  return (
    <html
      lang="en"
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
          Skip to main content
        </a>
        <AnalyticsProvider>
          <DesignSystemProvider>
            <ServiceWorkerRegistration />
            <Header />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
          </DesignSystemProvider>
        </AnalyticsProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
