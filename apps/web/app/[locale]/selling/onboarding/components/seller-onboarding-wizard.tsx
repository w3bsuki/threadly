'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components';
import { ArrowRight, CheckCircle2, CreditCard, Truck } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';

interface SellerOnboardingWizardProps {
  userId: string;
  locale: string;
}

export function SellerOnboardingWizard({
  userId,
  locale,
}: SellerOnboardingWizardProps) {
  // Temporary implementation that provides helpful information
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Seller Profile</CardTitle>
          <CardDescription>
            Set up your account to start selling on Threadly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle>Why do we need this information?</AlertTitle>
            <AlertDescription>
              To ensure safe transactions and timely payouts, we need to verify
              your identity and set up your payment methods. This one-time setup
              takes just a few minutes.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <div>
                <h3 className="font-semibold">Verify Your Identity</h3>
                <p className="text-muted-foreground text-sm">
                  Basic information to keep our marketplace safe
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <h3 className="font-semibold">Set Up Payouts</h3>
                <p className="text-muted-foreground text-sm">
                  Connect your bank account to receive payments
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
              <div>
                <h3 className="font-semibold">Shipping Preferences</h3>
                <p className="text-muted-foreground text-sm">
                  Choose how you'll ship items to buyers
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] bg-muted p-4">
            <p className="font-semibold text-sm">
              Benefits of selling on Threadly:
            </p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• Reach thousands of fashion-conscious buyers</li>
              <li>• Secure payments processed by Stripe</li>
              <li>• Easy shipping with prepaid labels</li>
              <li>• Low 10% selling fee on successful sales</li>
            </ul>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link
              href={`${env.NEXT_PUBLIC_APP_URL}/${locale}/selling/onboarding`}
              target="_blank"
            >
              Complete Seller Setup
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <p className="text-center text-muted-foreground text-xs">
            Opens in seller dashboard for secure account setup
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
