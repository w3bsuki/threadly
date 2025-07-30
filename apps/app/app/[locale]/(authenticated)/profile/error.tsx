'use client';

import { ErrorPage } from '@repo/tooling/utils/src/error-handling/error-pages';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function ProfileError({
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
      description="Failed to load your profile information. Please try again."
      error={error}
      errorId={error.digest || null}
      level="section"
      onReset={reset}
      title="Profile Error"
    />
  );
}
