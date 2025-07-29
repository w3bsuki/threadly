'use client';

import { Card, CardContent } from '@repo/ui/components/ui/card';
import {
  Camera,
  Clock,
  DollarSign,
  Package,
  Search,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Truck,
} from 'lucide-react';
import type { UserPreferenceRole } from '@/lib/database-types';

interface HowItWorksProps {
  selectedRole: UserPreferenceRole;
}

export function HowItWorks({
  selectedRole,
}: HowItWorksProps): React.JSX.Element {
  const buyerSteps = [
    {
      icon: Search,
      title: 'Browse & Discover',
      description:
        'Find unique fashion pieces from sellers worldwide. Filter by brand, size, and style.',
    },
    {
      icon: ShoppingBag,
      title: 'Secure Purchase',
      description:
        'Buy with confidence. Your payment is held securely until you receive your item.',
    },
    {
      icon: Truck,
      title: 'Track Delivery',
      description:
        'Get real-time updates on your order. Sellers ship within 3 business days.',
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description:
        'Confirm receipt and rate your experience. Help build our trusted community.',
    },
  ];

  const sellerSteps = [
    {
      icon: Camera,
      title: 'List Your Items',
      description:
        'Take photos, add descriptions, set your price. Listing is free and takes minutes.',
    },
    {
      icon: DollarSign,
      title: 'Make a Sale',
      description:
        'When someone buys, we handle the payment. You keep 95% - we take just 5%.',
    },
    {
      icon: Package,
      title: 'Ship Within 3 Days',
      description:
        'Pack securely and ship to buyer. Print shipping labels directly from your dashboard.',
    },
    {
      icon: Clock,
      title: 'Get Paid',
      description:
        'Once delivered, funds are released to your balance. Request payouts anytime over $20.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Buyer Protection',
      description:
        "Money back guarantee if item doesn't arrive or isn't as described.",
    },
    {
      icon: TrendingUp,
      title: 'Low Fees',
      description:
        'Only 5% commission on sales. No listing fees, no hidden costs.',
    },
  ];

  const showBuyerInfo = selectedRole === 'BUYER' || selectedRole === 'BOTH';
  const showSellerInfo = selectedRole === 'SELLER' || selectedRole === 'BOTH';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="mb-2 font-bold text-2xl">How Threadly Works</h2>
        <p className="text-muted-foreground">
          {selectedRole === 'BOTH'
            ? 'Everything you need to know about buying and selling'
            : selectedRole === 'SELLER'
              ? 'Start selling in minutes with these simple steps'
              : 'Shop with confidence on our secure platform'}
        </p>
      </div>

      {showBuyerInfo && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">For Buyers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {buyerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card className="border-muted" key={index}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {showBuyerInfo && showSellerInfo && <hr className="my-8" />}

      {showSellerInfo && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">For Sellers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sellerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card className="border-muted" key={index}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-lg">Platform Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card className="bg-muted/50" key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] bg-background">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
