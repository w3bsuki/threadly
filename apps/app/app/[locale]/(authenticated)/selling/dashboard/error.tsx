'use client';

import { ErrorPage } from '@repo/tooling/utils/src/error-handling/error-pages';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function SellingDashboardError({
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
      description="Unable to load your seller analytics. Please refresh the page or try again later."
      error={error}
      errorId={error.digest || null}
      level="section"
      onReset={reset}
      title="Seller Dashboard Error"
    />
  );
}
