'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@repo/ui/components';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-2xl p-8">
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong!</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Unable to load the product creation page.</p>

          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-2">
              <p className="font-mono text-xs">Error: {error.message}</p>
              {error.digest && (
                <p className="font-mono text-xs">Digest: {error.digest}</p>
              )}
              {error.stack && (
                <pre className="max-h-32 overflow-auto text-xs">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/">Go home</a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
