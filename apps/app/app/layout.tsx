import { env } from '@/env';
import '@repo/design-system/styles/globals.css';
import './styles.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { AuthProvider } from '@repo/auth/provider';
import { AnalyticsProvider } from '@repo/analytics';
import { ToastProvider } from '@/components/toast';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <body>
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
            <ToastProvider />
            {children}
          </DesignSystemProvider>
        </AnalyticsProvider>
      </AuthProvider>
      <Toolbar />
    </body>
  </html>
);

export default RootLayout;
