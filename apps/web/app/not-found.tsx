import { Button } from '@repo/design-system/components';
import { ArrowLeft, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300">404</div>
          <h1 className="text-3xl font-semibold text-gray-900 mt-4">Page Not Found</h1>
          <p className="text-gray-600 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="inline-flex items-center gap-2">
              <Link href="/">
                <Home size={16} />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="inline-flex items-center gap-2">
              <Link href="/browse">
                <Search size={16} />
                Browse Products
              </Link>
            </Button>
          </div>
          
          <Button asChild variant="ghost" className="inline-flex items-center gap-2">
            <Link href="javascript:history.back()">
              <ArrowLeft size={16} />
              Go Back
            </Link>
          </Button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact support</Link></p>
        </div>
      </div>
    </div>
  );
}