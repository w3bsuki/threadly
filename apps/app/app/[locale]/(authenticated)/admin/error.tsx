'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { AlertTriangle, Shield } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Shield className="h-12 w-12 text-muted-foreground" />
              <AlertTriangle className="-bottom-1 -right-1 absolute h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Panel Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            An error occurred while loading the admin panel. This may be due to
            insufficient permissions or a temporary issue.
          </p>
          {error.digest && (
            <p className="font-mono text-muted-foreground text-xs">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
