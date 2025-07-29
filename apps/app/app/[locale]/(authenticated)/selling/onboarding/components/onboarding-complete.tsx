'use client';

import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function OnboardingComplete() {
  const router = useRouter();

  const nextSteps = [
    {
      icon: Package,
      title: 'List Your First Item',
      description: 'Start selling by creating your first listing',
      action: () => router.push('/selling/new'),
      buttonText: 'Create Listing',
    },
    {
      icon: TrendingUp,
      title: 'Optimize Your Profile',
      description: 'Add more items and build your reputation',
      action: () => router.push('/profile'),
      buttonText: 'View Profile',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">You're All Set!</CardTitle>
          <CardDescription className="text-base">
            Your seller account is ready. Start listing items and making sales
            today.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className="mt-1">5%</Badge>
            <div>
              <p className="font-medium">Platform Fee</p>
              <p className="text-muted-foreground text-sm">
                We only take 5% when you make a sale. No listing fees!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge className="mt-1" variant="secondary">
              $20
            </Badge>
            <div>
              <p className="font-medium">Minimum Payout</p>
              <p className="text-muted-foreground text-sm">
                Request payouts anytime your balance reaches $20 or more.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge className="mt-1" variant="outline">
              3 days
            </Badge>
            <div>
              <p className="font-medium">Shipping Time</p>
              <p className="text-muted-foreground text-sm">
                Ship items within 3 business days to maintain your seller
                rating.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {nextSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card
              className="cursor-pointer transition-shadow hover:shadow-md"
              key={index}
              onClick={step.action}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Icon className="h-8 w-8 text-primary" />
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={step.action}>
                  {step.buttonText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={() => router.push('/dashboard')}
          size="lg"
          variant="outline"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
