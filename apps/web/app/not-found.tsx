import { Button } from '@repo/ui/components';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md px-6 text-center">
        <div className="mb-8">
          <div className="font-bold text-9xl text-muted-foreground">404</div>
          <h1 className="mt-4 font-semibold text-3xl text-foreground">
            Page Not Found
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="inline-flex items-center gap-2"
              variant="default"
            >
              <Link href="/">
                <Home size={16} />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              className="inline-flex items-center gap-2"
              variant="outline"
            >
              <Link href="/browse">
                <Search size={16} />
                Browse Products
              </Link>
            </Button>
          </div>

          <Button
            asChild
            className="inline-flex items-center gap-2"
            variant="ghost"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft size={16} />
              Go Back
            </Link>
          </Button>
        </div>

        <div className="mt-12 text-muted-foreground text-sm">
          <p>
            Need help?{' '}
            <Link className="text-blue-600 hover:underline" href="/contact">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
