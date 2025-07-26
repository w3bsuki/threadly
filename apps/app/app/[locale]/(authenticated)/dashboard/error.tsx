'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@repo/error-handling/error-pages';
import * as Sentry from '@sentry/nextjs';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorPage
      error={error}
      errorId={error.digest || null}
      level="section"
      onReset={reset}
      title="Dashboard Error"
      description="Something went wrong while loading your dashboard. Please try again."
    />
  );
}