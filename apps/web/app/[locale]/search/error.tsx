'use client';

import { useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import Link from 'next/link';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error('Search page error:', error);
    }
  }, [error]);

  return (
    <div className="container mx-auto min-h-[600px] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-2">
              We encountered an error while searching. This might be due to network issues or temporary server problems.
            </p>
            <p className="text-xs text-muted-foreground">
              Please try again or browse our categories below.
            </p>
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button 
            onClick={reset} 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/categories" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Browse Categories
            </Button>
          </Link>
          
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}