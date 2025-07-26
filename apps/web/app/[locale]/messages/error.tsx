'use client';

import { useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import Link from 'next/link';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (error) {
      console.error('Messages error:', error);
    }
  }, [error]);

  const isNetworkError = error.message?.toLowerCase().includes('network') || 
                        error.message?.toLowerCase().includes('fetch');

  return (
    <div className="container mx-auto min-h-[600px] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Messages Unavailable</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="text-sm mb-2">
              {isNetworkError 
                ? 'Unable to connect to the messaging service. Please check your internet connection.'
                : 'We encountered an error loading your messages. Please try again.'}
            </p>
            <p className="text-xs text-muted-foreground">
              Your messages are safe and will be available once the connection is restored.
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
          
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Go to Dashboard
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