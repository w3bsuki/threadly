'use client';

import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { 
  Search, 
  ShoppingBag, 
  Truck, 
  Star, 
  Camera,
  DollarSign,
  Package,
  Clock,
  Shield,
  TrendingUp
} from 'lucide-react';
import type { UserPreferenceRole } from '@repo/database';

interface HowItWorksProps {
  selectedRole: UserPreferenceRole;
}

export function HowItWorks({ selectedRole }: HowItWorksProps): React.JSX.Element {
  const buyerSteps = [
    {
      icon: Search,
      title: 'Browse & Discover',
      description: 'Find unique fashion pieces from sellers worldwide. Filter by brand, size, and style.',
    },
    {
      icon: ShoppingBag,
      title: 'Secure Purchase',
      description: 'Buy with confidence. Your payment is held securely until you receive your item.',
    },
    {
      icon: Truck,
      title: 'Track Delivery',
      description: 'Get real-time updates on your order. Sellers ship within 3 business days.',
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Confirm receipt and rate your experience. Help build our trusted community.',
    },
  ];

  const sellerSteps = [
    {
      icon: Camera,
      title: 'List Your Items',
      description: 'Take photos, add descriptions, set your price. Listing is free and takes minutes.',
    },
    {
      icon: DollarSign,
      title: 'Make a Sale',
      description: 'When someone buys, we handle the payment. You keep 95% - we take just 5%.',
    },
    {
      icon: Package,
      title: 'Ship Within 3 Days',
      description: 'Pack securely and ship to buyer. Print shipping labels directly from your dashboard.',
    },
    {
      icon: Clock,
      title: 'Get Paid',
      description: 'Once delivered, funds are released to your balance. Request payouts anytime over $20.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Buyer Protection',
      description: 'Money back guarantee if item doesn\'t arrive or isn\'t as described.',
    },
    {
      icon: TrendingUp,
      title: 'Low Fees',
      description: 'Only 5% commission on sales. No listing fees, no hidden costs.',
    },
  ];

  const showBuyerInfo = selectedRole === 'BUYER' || selectedRole === 'BOTH';
  const showSellerInfo = selectedRole === 'SELLER' || selectedRole === 'BOTH';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">How Threadly Works</h2>
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
          <h3 className="text-lg font-semibold">For Buyers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {buyerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border-muted">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {showBuyerInfo && showSellerInfo && (
        <hr className="my-8" />
      )}

      {showSellerInfo && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">For Sellers</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {sellerSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border-muted">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
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
        <h3 className="text-lg font-semibold">Platform Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
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