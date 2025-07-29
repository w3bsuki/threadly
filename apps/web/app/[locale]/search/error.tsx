'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui/components/ui/alert';
import { Button } from '@repo/ui/components/ui/button';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="container mx-auto flex min-h-[600px] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert className="border-destructive/20" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2 text-sm">
              We encountered an error while searching. This might be due to
              network issues or temporary server problems.
            </p>
            <p className="text-muted-foreground text-xs">
              Please try again or browse our categories below.
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

          <Link className="w-full sm:w-auto" href="/categories">
            <Button className="w-full" size="sm" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Browse Categories
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
