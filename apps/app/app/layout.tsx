import { env } from '@/env';
import '@repo/design-system/styles/globals.css';
import './styles.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { AuthProvider } from '@repo/auth/provider';
import { AnalyticsProvider } from '@repo/analytics';
import { Toaster } from '@repo/design-system/components';
import { AppErrorBoundary } from '@/components/error-boundaries';
import * as React from 'react';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Threadly Dashboard - Manage Your Fashion Business',
  description: 'Sell unique fashion items, manage your inventory, and grow your sustainable fashion business on Threadly.',
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
  <html lang="en" className={fonts} suppressHydrationWarning>
    <body>
      <AppErrorBoundary>
        <AuthProvider
          privacyUrl={new URL(
            '/legal/privacy',
            env.NEXT_PUBLIC_WEB_URL
          ).toString()}
          termsUrl={new URL('/legal/terms', env.NEXT_PUBLIC_WEB_URL).toString()}
          helpUrl={env.NEXT_PUBLIC_DOCS_URL}
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
