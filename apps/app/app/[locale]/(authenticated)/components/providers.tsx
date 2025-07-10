'use client';

import { ReactNode } from 'react';
import { RealTimeWrapper } from './real-time-wrapper';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { Toaster } from '@repo/design-system/components';
import { PostHogIdentifier } from './posthog-identifier';
import { I18nProvider } from './i18n-provider';
import type { Dictionary } from '@repo/internationalization';

interface ProvidersProps {
  children: ReactNode;
  userId: string;
  dictionary: Dictionary;
  locale: string;
}

export function Providers({ children, userId, dictionary, locale }: ProvidersProps) {
  return (
    <I18nProvider dictionary={dictionary} locale={locale}>
      <RealTimeWrapper userId={userId}>
        <NotificationsProvider userId={userId}>
          {children}
          <Toaster />
          <PostHogIdentifier />
        </NotificationsProvider>
      </RealTimeWrapper>
    </I18nProvider>
  );
}