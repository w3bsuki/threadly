import { env } from '@/env';
import '@repo/ui/styles/globals.css';
import './styles.css';
import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';
import { DesignSystemProvider } from '@repo/ui';
import { Toaster } from '@repo/ui/components';
import { fonts } from '@repo/ui/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import type { Metadata, Viewport } from 'next';
import type * as React from 'react';
import { AppErrorBoundary } from '@/components/error-boundaries';

export const metadata: Metadata = {
  title: 'Threadly Dashboard - Manage Your Fashion Business',
  description:
    'Sell unique fashion items, manage your inventory, and grow your sustainable fashion business on Threadly.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

type RootLayoutProperties = {
  readonly children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html className={fonts} lang="en" suppressHydrationWarning>
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
      <meta name="apple-mobile-web-app-title" content="Threadly App" />
      <link href="https://img.clerk.com" rel="preconnect" />
      <link href="https://utfs.io" rel="preconnect" />
      <link href="https://img.clerk.com" rel="dns-prefetch" />
      <link href="https://utfs.io" rel="dns-prefetch" />
    </head>
    <body>
      <AppErrorBoundary>
        <AuthProvider
          helpUrl={env.NEXT_PUBLIC_DOCS_URL}
          privacyUrl={new URL(
            '/legal/privacy',
            env.NEXT_PUBLIC_WEB_URL
          ).toString()}
          termsUrl={new URL('/legal/terms', env.NEXT_PUBLIC_WEB_URL).toString()}
        >
          <AnalyticsProvider>
            <DesignSystemProvider>
              <Toaster />
              {children}
            </DesignSystemProvider>
          </AnalyticsProvider>
        </AuthProvider>
        <Toolbar />
      </AppErrorBoundary>
    </body>
  </html>
);

export default RootLayout;
