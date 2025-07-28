'use client';

import React from 'react';

interface ErrorPageProps {
  error: Error;
  errorId: string | null;
  level: 'page' | 'component' | 'app';
  onReset?: () => void;
}

export function ErrorPage({ error, errorId, level, onReset }: ErrorPageProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (level === 'app') {
    return (
      <AppErrorPage
        error={error}
        errorId={errorId}
        isDevelopment={isDevelopment}
        onReset={onReset}
      />
    );
  }

  if (level === 'page') {
    return (
      <PageErrorPage
        error={error}
        errorId={errorId}
        isDevelopment={isDevelopment}
        onReset={onReset}
      />
    );
  }

  return (
    <ComponentErrorPage
      error={error}
      errorId={errorId}
      isDevelopment={isDevelopment}
      onReset={onReset}
    />
  );
}

function AppErrorPage({
  error,
  errorId,
  onReset,
  isDevelopment,
}: Omit<ErrorPageProps, 'level'> & { isDevelopment: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mb-4 font-bold text-3xl">Something went wrong</h1>
        <p className="mb-8 text-muted-foreground">
          We're sorry, but something unexpected happened. Our team has been
          notified and is working on a fix.
        </p>

        {errorId && (
          <p className="mb-8 font-mono text-muted-foreground text-xs">
            Error ID: {errorId}
          </p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
            onClick={onReset}
          >
            Try again
          </button>
          <a
            className="inline-flex items-center rounded-[var(--radius-md)] border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
            href="/"
          >
            Go to homepage
          </a>
        </div>

        {isDevelopment && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-muted-foreground text-sm">
              Error details (development only)
            </summary>
            <pre className="mt-4 overflow-auto rounded-[var(--radius-md)] bg-muted p-4 text-xs">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function PageErrorPage({
  error,
  errorId,
  onReset,
  isDevelopment,
}: Omit<ErrorPageProps, 'level'> & { isDevelopment: boolean }) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[var(--radius-lg)] border border-destructive/50 bg-destructive/10 p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="mb-2 font-semibold text-lg">Page Error</h2>
              <p className="mb-4 text-muted-foreground text-sm">
                This page encountered an error and cannot be displayed properly.
              </p>

              {errorId && (
                <p className="mb-4 font-mono text-muted-foreground text-xs">
                  Reference: {errorId}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  className="font-medium text-primary text-sm hover:underline"
                  onClick={onReset}
                >
                  Reload page
                </button>
                <a
                  className="font-medium text-muted-foreground text-sm hover:text-foreground"
                  href="/"
                >
                  Go back home
                </a>
              </div>

              {isDevelopment && (
                <div className="mt-6">
                  <p className="mb-2 font-medium text-muted-foreground text-xs">
                    Error message:
                  </p>
                  <p className="font-mono text-destructive text-xs">
                    {error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentErrorPage({
  error,
  errorId,
  onReset,
  isDevelopment,
}: Omit<ErrorPageProps, 'level'> & { isDevelopment: boolean }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-destructive/50 bg-destructive/5 p-6">
      <div className="mb-3 flex items-center gap-3">
        <svg
          className="h-5 w-5 text-destructive"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="font-medium text-sm">Unable to load this section</p>
      </div>

      <p className="mb-3 text-muted-foreground text-sm">
        We're having trouble displaying this content. Please try again.
      </p>

      <button
        className="font-medium text-primary text-sm hover:underline"
        onClick={onReset}
      >
        Retry
      </button>

      {isDevelopment && errorId && (
        <p className="mt-3 font-mono text-muted-foreground text-xs">
          {errorId}
        </p>
      )}
    </div>
  );
}

// Not Found Error Page
export function NotFoundErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            viewBox="0 0 24 24"
          >
            <path
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mb-4 font-bold text-6xl">404</h1>
        <h2 className="mb-4 font-semibold text-2xl">Page not found</h2>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or deleted.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            className="inline-flex items-center rounded-[var(--radius-md)] bg-primary px-4 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
            href="/"
          >
            Go to homepage
          </a>
          <button
            className="inline-flex items-center rounded-[var(--radius-md)] border border-input bg-background px-4 py-2 font-medium text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => window.history.back()}
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}

// Maintenance Error Page
export function MaintenanceErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            viewBox="0 0 24 24"
          >
            <path
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mb-4 font-bold text-3xl">Under Maintenance</h1>
        <p className="mb-8 text-muted-foreground">
          We're currently performing scheduled maintenance. We'll be back online
          shortly.
        </p>

        <div className="mb-8">
          <div className="mx-auto h-2 w-48 overflow-hidden rounded-[var(--radius-full)] bg-muted">
            <div className="h-full w-1/3 animate-pulse bg-primary" />
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          Follow us on social media for updates
        </p>
      </div>
    </div>
  );
}
