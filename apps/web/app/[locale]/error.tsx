'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@repo/error-handling';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorPage
      error={error}
      errorId={error.digest || null}
      level="page"
      onReset={reset}
    />
  );
}