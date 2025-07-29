'use client';

import { Button } from '@repo/ui/components';
import { AlertCircle } from 'lucide-react';

export default function SellingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="font-bold text-2xl">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We encountered an error while loading the selling dashboard. This
          might be due to a configuration issue.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 rounded-[var(--radius-md)] bg-muted p-4 text-left">
            <p className="break-all font-mono text-muted-foreground text-sm">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-muted-foreground text-xs">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>Try again</Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
