'use client';

import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import {
  Camera,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  Heart,
  MessageSquare,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';

interface OnboardingSlide {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    title: 'Welcome to Threadly',
    subtitle: 'Your Premium Fashion Marketplace',
    content: (
      <div className="space-y-6">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="h-32 w-32 animate-pulse rounded-[var(--radius-full)] bg-gradient-to-br from-purple-500 to-pink-500" />
            <Sparkles className="absolute top-0 right-0 h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mb-1 font-semibold">Trusted Community</h3>
            <p className="text-muted-foreground text-sm">
              Join thousands of fashion lovers
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-green-100">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mb-1 font-semibold">100% Secure</h3>
            <p className="text-muted-foreground text-sm">
              Protected payments & shipping
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="mb-1 font-semibold">Low Fees</h3>
            <p className="text-muted-foreground text-sm">
              Only 5% commission on sales
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'How Buying Works',
    subtitle: 'Shop with confidence in 4 simple steps',
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Browse & Discover</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Find unique pieces from verified sellers. Filter by brand, size,
                and style.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-green-100">
              <span className="font-bold text-green-600">2</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Secure Checkout</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Your payment is held securely until you receive and confirm your
                item.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
              <span className="font-bold text-purple-600">3</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Truck className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Track Shipment</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Real-time updates from purchase to delivery. Sellers ship within
                3 days.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-yellow-100">
              <span className="font-bold text-yellow-600">4</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold">Rate & Review</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Confirm receipt and share your experience to help our community.
              </p>
            </div>
          </div>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-900">
                  Buyer Protection Guarantee
                </p>
                <p className="text-green-700">
                  Full refund if item doesn't arrive or isn't as described
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    title: 'How Selling Works',
    subtitle: 'Turn your closet into cash in minutes',
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-pink-100">
              <span className="font-bold text-pink-600">1</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Camera className="h-5 w-5 text-pink-600" />
                <h4 className="font-semibold">Snap & List</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Take photos, add description, set price. Listing is free and
                takes 2 minutes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-green-100">
              <span className="font-bold text-green-600">2</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Make Sales</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                When someone buys, we handle payment. You keep 95% of the sale
                price.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Ship Fast</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Print label from dashboard, ship within 3 days. We provide
                tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-purple-100">
              <span className="font-bold text-purple-600">4</span>
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Get Paid</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                Funds released after delivery. Request payout anytime over $20.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="font-medium text-purple-900 text-sm">
                  Only 5% Fee
                </p>
              </div>
              <p className="mt-1 text-purple-700 text-xs">
                No listing fees or hidden costs
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <p className="font-medium text-blue-900 text-sm">
                  24/7 Support
                </p>
              </div>
              <p className="mt-1 text-blue-700 text-xs">
                We're here to help you succeed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    title: 'Safety & Trust',
    subtitle: 'Your security is our top priority',
    content: (
      <div className="space-y-6">
        <div className="grid gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Secure Payments</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      All payments processed by Stripe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Money held until delivery confirmed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Full refund protection for buyers
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Verified Community</h4>
                  <ul className="space-y-1 text-muted-foreground text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      All users verified through secure auth
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Ratings and reviews from real buyers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      Report system for safety concerns
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-pink-500" />
            <p className="mb-1 font-semibold text-purple-900">
              Join Our Community
            </p>
            <p className="text-purple-700 text-sm">
              Thousands of fashion lovers buying and selling every day
            </p>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    subtitle: 'Start exploring Threadly now',
    content: (
      <div className="space-y-6">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-full)] bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <Sparkles className="-top-2 -right-2 absolute h-6 w-6 text-yellow-400" />
          </div>
        </div>

        <div className="mb-8 space-y-2 text-center">
          <h3 className="font-semibold text-xl">Welcome to Threadly!</h3>
          <p className="text-muted-foreground">
            Choose how you'd like to start
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer border-2 transition-colors hover:border-primary">
            <CardContent className="pt-6">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-blue-100">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold">Start Shopping</h4>
                <p className="text-muted-foreground text-sm">
                  Browse thousands of unique fashion items
                </p>
                <Button className="w-full" variant="outline">
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Browse Items
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer border-2 transition-colors hover:border-primary">
            <CardContent className="pt-6">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-green-100">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold">List Your First Item</h4>
                <p className="text-muted-foreground text-sm">
                  Turn your fashion into cash in minutes
                </p>
                <Button className="w-full" variant="outline">
                  <ChevronRight className="mr-2 h-4 w-4" />
                  Start Selling
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 text-center">
          <p className="text-muted-foreground text-sm">
            You can always switch between buying and selling in your dashboard
          </p>
        </div>
      </div>
    ),
  },
];
