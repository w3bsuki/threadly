'use client';

import { useEffect } from 'react';
import { ErrorPage } from '@repo/error-handling/error-pages';
import * as Sentry from '@sentry/nextjs';

export default function ListingsError({
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
      title="Listings Error"
      description="Failed to load your product listings. Please try refreshing the page."
    />
  );
}