'use client';

import { fonts } from '@repo/design-system/lib/fonts';
import { ErrorPage } from '@repo/error-handling/error-pages';
import type NextError from 'next/error';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  useEffect(() => {
    // Capture exception with Sentry
    Sentry.captureException(error, {
      tags: {
        location: 'global-error-boundary',
      },
    });
  }, [error]);

  return (
    <html lang="en" className={fonts}>
      <body>
        <ErrorPage
          error={error}
          errorId={error.digest || null}
          level="app"
          onReset={reset}
        />
      </body>
    </html>
  );
};

export default GlobalError;
