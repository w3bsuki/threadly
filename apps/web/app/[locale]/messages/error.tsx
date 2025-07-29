'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui/components/ui/alert';
import { Button } from '@repo/ui/components/ui/button';
import { AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  const isNetworkError =
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('fetch');

  return (
    <div className="container mx-auto flex min-h-[600px] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert className="border-destructive/20" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Messages Unavailable</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2 text-sm">
              {isNetworkError
                ? 'Unable to connect to the messaging service. Please check your internet connection.'
                : 'We encountered an error loading your messages. Please try again.'}
            </p>
            <p className="text-muted-foreground text-xs">
              Your messages are safe and will be available once the connection
              is restored.
            </p>
          </AlertDescription>
        </Alert>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            onClick={reset}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Link className="w-full sm:w-auto" href="/dashboard">
            <Button className="w-full" size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>

          <Link className="w-full sm:w-auto" href="/">
            <Button className="w-full" size="sm" variant="default">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
