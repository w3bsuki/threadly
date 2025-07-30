'use client';

import { ErrorPage } from '@repo/api/utils/error-handling/error-pages';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function OrdersError({
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
      description="Unable to load your orders. Please refresh the page or try again later."
      error={error}
      errorId={error.digest || null}
      level="section"
      onReset={reset}
      title="Orders Error"
    />
  );
}
