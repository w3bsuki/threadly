'use client';

import { fonts } from '@repo/design-system/lib/fonts';
import { ErrorPage } from '@repo/error-handling/error-pages';
import { captureException } from '@sentry/nextjs';
import type NextError from 'next/error';
import { useEffect } from 'react';

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    captureException(error);
  }, [error]);

  // Convert NextError to standard Error for ErrorPage
  const standardError: Error = {
    name: 'Error',
    message: 'An unexpected error occurred',
    stack: undefined,
  };

  return (
    <html className={fonts} lang="en">
      <body>
        <ErrorPage
          error={standardError}
          errorId={error.digest || null}
          level="app"
          onReset={reset}
        />
      </body>
    </html>
  );
};

export default GlobalError;
