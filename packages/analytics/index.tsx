import type { ReactNode } from 'react';
import { GoogleAnalytics } from './google';
import { keys } from './keys';
import { PostHogProvider } from './posthog/client';
import { VercelAnalytics } from './vercel';

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = keys();

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <PostHogProvider>
    {children}
    <VercelAnalytics />
    {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
      <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    )}
  </PostHogProvider>
);

// Export client-side analytics utilities and hooks
export { useAnalytics } from './posthog/client';
export { useAnalyticsEvents } from './hooks/use-analytics-events';
export * from './events';

// Server-side analytics should be imported directly from './posthog/server'
// to avoid importing 'server-only' in client components
