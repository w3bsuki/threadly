'use client';

import { Toaster } from '@repo/ui/components';
import type { Dictionary } from '@repo/content/internationalization';
import { NotificationsProvider } from '@repo/features/notifications/components/provider';
import type { ReactNode } from 'react';
import { I18nProvider } from './i18n-provider';
import { PostHogIdentifier } from './posthog-identifier';
import { RealTimeWrapper } from './real-time-wrapper';
import { AppTRPCProvider } from '../../../../lib/trpc';

interface ProvidersProps {
  children: ReactNode;
  userId: string;
  dictionary: Dictionary;
  locale: string;
}

export function Providers({
  children,
  userId,
  dictionary,
  locale,
}: ProvidersProps): React.JSX.Element {
  return (
    <AppTRPCProvider>
      <I18nProvider dictionary={dictionary} locale={locale}>
        <RealTimeWrapper userId={userId}>
          <NotificationsProvider userId={userId}>
            {children}
            <Toaster />
            <PostHogIdentifier />
          </NotificationsProvider>
        </RealTimeWrapper>
      </I18nProvider>
    </AppTRPCProvider>
  );
}
