import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components';
import { WifiOff, RefreshCw, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            You're offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            Check your internet connection and try again. Some content may be available from cache.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1">
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>You can still browse cached pages and products you've viewed before.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}