import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { Home, RefreshCw, Search, WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-secondary">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="font-semibold text-foreground text-xl">
            You're offline
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Check your internet connection and try again. Some content may be
            available from cache.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => window.location.reload()}
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button asChild className="flex-1" variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button asChild className="flex-1" variant="outline">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-center text-muted-foreground text-sm">
            <p>
              You can still browse cached pages and products you've viewed
              before.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
