import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { SignOutButton } from '@repo/auth/client';

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-destructive">
            <AlertCircle className="h-full w-full" />
          </div>
          <CardTitle>Account Suspended</CardTitle>
          <CardDescription>
            Your account has been temporarily suspended due to policy violations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake or would like to appeal this decision, 
            please contact our support team at support@threadly.com
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">What happens now?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All your active listings have been removed</li>
              <li>• Pending orders have been cancelled</li>
              <li>• You cannot create new listings or make purchases</li>
              <li>• Your account may be reinstated after review</li>
            </ul>
          </div>
          
          <div className="pt-4 flex flex-col gap-2">
            <Button asChild variant="outline">
              <a href="mailto:support@threadly.com">Contact Support</a>
            </Button>
            <SignOutButton>
              <Button variant="ghost" className="w-full">
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}