'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { StripeConnectStatus } from './components/stripe-connect-status';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@repo/design-system/components/ui/alert';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, DollarSign, Package, ShieldCheck, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { toast } from '@/components/toast';

type AccountStatus = {
  status: 'not_connected' | 'connected' | 'pending' | 'restricted' | 'disabled';
  accountId?: string;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  canAcceptPayments?: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
    errors: any[];
    disabled_reason?: string;
  };
  requirementsCount?: number;
  hasPendingVerification?: boolean;
  message?: string;
};

const SellerOnboardingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);

  // Check for success or refresh params
  const success = searchParams.get('success') === 'true';
  const refresh = searchParams.get('refresh') === 'true';

  useEffect(() => {
    checkAccountStatus();
  }, [success]);

  useEffect(() => {
    if (success) {
      toast.success('Successfully connected your Stripe account!');
    } else if (refresh) {
      toast.info('Please complete your account setup to start selling.');
    }
  }, [success, refresh]);

  const checkAccountStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check account status');
      }
      
      setAccountStatus(data);
    } catch (error) {
      toast.error('Failed to check account status');
    } finally {
      setLoading(false);
    }
  };

  const startOnboarding = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect/onboarding', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start onboarding');
      }
      
      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not configured')) {
        toast.error('Payment processing is not available at the moment.');
      } else {
        toast.error('Failed to start onboarding. Please try again.');
      }
      setConnecting(false);
    }
  };

  const refreshOnboarding = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect/onboarding');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh onboarding');
      }
      
      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (error) {
      toast.error('Failed to refresh onboarding. Please try again.');
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Onboarding</h1>
          <p className="text-muted-foreground">Loading your account status...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seller Onboarding</h1>
        <p className="text-muted-foreground">
          Connect your Stripe account to start accepting payments and grow your business on Threadly.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-6">

        {/* Account Status */}
        {accountStatus && (
          <StripeConnectStatus status={accountStatus} />
        )}

        {/* Main Content based on status */}
        {accountStatus?.status === 'not_connected' && (
          <>
            {/* Benefits Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Competitive Fees
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Keep more of your earnings with our low 5% platform fee. Get paid directly to your bank account.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Fast Payouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Receive your earnings quickly with automatic payouts. Money transfers to your bank in 2-7 business days.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                      Secure Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Stripe's world-class security protects both you and your buyers. PCI compliant and fraud protected.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Analytics & Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your sales, monitor performance, and grow your business with detailed analytics.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Section */}
              <Card className="border-primary">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Ready to Start Selling?</CardTitle>
                  <CardDescription className="text-base">
                    Connect your Stripe account in just a few minutes and start accepting payments today.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button 
                    size="lg" 
                    onClick={startOnboarding}
                    disabled={connecting}
                    className="min-w-[200px]"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Connect with Stripe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
        )}

        {accountStatus?.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Account Setup Incomplete
                </CardTitle>
                <CardDescription>
                  Your account is partially set up. Complete the remaining steps to start accepting payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountStatus.hasPendingVerification && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Verification Pending</AlertTitle>
                    <AlertDescription>
                      Your information is being verified. This usually takes 1-2 business days.
                    </AlertDescription>
                  </Alert>
                )}

                {accountStatus.requirements && accountStatus.requirements.currentlyDue.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Action Required:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {accountStatus.requirements.currentlyDue.map((req, index) => (
                        <li key={index}>{req.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={refreshOnboarding}
                  disabled={connecting}
                  className="w-full"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Continue Setup
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
        )}

        {accountStatus?.status === 'connected' && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  You're All Set!
                </CardTitle>
                <CardDescription>
                  Your Stripe account is connected and ready to accept payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Charges Enabled</p>
                    <Badge variant={accountStatus.chargesEnabled ? 'default' : 'secondary'}>
                      {accountStatus.chargesEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payouts Enabled</p>
                    <Badge variant={accountStatus.payoutsEnabled ? 'default' : 'secondary'}>
                      {accountStatus.payoutsEnabled ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => router.push('/selling/new')} className="flex-1">
                    <Package className="mr-2 h-4 w-4" />
                    List Your First Item
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/selling/listings')}>
                    View Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
        )}

        {(accountStatus?.status === 'restricted' || accountStatus?.status === 'disabled') && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Account {accountStatus.status === 'restricted' ? 'Restricted' : 'Disabled'}
                </CardTitle>
                <CardDescription>
                  There's an issue with your Stripe account that needs attention.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountStatus.requirements?.disabled_reason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Reason</AlertTitle>
                    <AlertDescription>
                      {accountStatus.requirements.disabled_reason}
                    </AlertDescription>
                  </Alert>
                )}

                {accountStatus.requirements && accountStatus.requirements.currentlyDue.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {accountStatus.requirements.currentlyDue.map((req, index) => (
                        <li key={index}>{req.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  onClick={refreshOnboarding}
                  disabled={connecting}
                  variant="destructive"
                  className="w-full"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Resolve Issues'
                  )}
                </Button>
              </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
};

export default SellerOnboardingPage;