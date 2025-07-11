'use client';

import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { 
  Sparkles,
  ShoppingBag,
  Package,
  Shield,
  Users,
  TrendingUp,
  Camera,
  DollarSign,
  Clock,
  ChevronRight,
  CheckCircle,
  Star,
  Truck,
  MessageSquare,
  Heart
} from 'lucide-react';

interface OnboardingSlide {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    title: "Welcome to Threadly",
    subtitle: "Your Premium Fashion Marketplace",
    content: (
      <div className="space-y-6">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
            <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Trusted Community</h3>
            <p className="text-sm text-muted-foreground">Join thousands of fashion lovers</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">100% Secure</h3>
            <p className="text-sm text-muted-foreground">Protected payments & shipping</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Low Fees</h3>
            <p className="text-sm text-muted-foreground">Only 5% commission on sales</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "How Buying Works",
    subtitle: "Shop with confidence in 4 simple steps",
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Browse & Discover</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find unique pieces from verified sellers. Filter by brand, size, and style.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="font-bold text-green-600">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Secure Checkout</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Your payment is held securely until you receive and confirm your item.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="font-bold text-purple-600">3</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">Track Shipment</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time updates from purchase to delivery. Sellers ship within 3 days.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="font-bold text-yellow-600">4</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold">Rate & Review</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Confirm receipt and share your experience to help our community.
              </p>
            </div>
          </div>
        </div>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Buyer Protection Guarantee</p>
                <p className="text-green-700">Full refund if item doesn't arrive or isn't as described</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  },
  {
    title: "How Selling Works",
    subtitle: "Turn your closet into cash in minutes",
    content: (
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="font-bold text-pink-600">1</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="w-5 h-5 text-pink-600" />
                <h4 className="font-semibold">Snap & List</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Take photos, add description, set price. Listing is free and takes 2 minutes.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="font-bold text-green-600">2</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold">Make Sales</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                When someone buys, we handle payment. You keep 95% of the sale price.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Ship Fast</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Print label from dashboard, ship within 3 days. We provide tracking.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="font-bold text-purple-600">4</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold">Get Paid</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Funds released after delivery. Request payout anytime over $20.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-3 md:grid-cols-2">
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Only 5% Fee</p>
              </div>
              <p className="text-xs text-purple-700 mt-1">No listing fees or hidden costs</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">24/7 Support</p>
              </div>
              <p className="text-xs text-blue-700 mt-1">We're here to help you succeed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    title: "Safety & Trust",
    subtitle: "Your security is our top priority",
    content: (
      <div className="space-y-6">
        <div className="grid gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Secure Payments</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      All payments processed by Stripe
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Money held until delivery confirmed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
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
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Verified Community</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      All users verified through secure auth
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Ratings and reviews from real buyers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Report system for safety concerns
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6 text-center">
            <Heart className="w-12 h-12 text-pink-500 mx-auto mb-3" />
            <p className="font-semibold text-purple-900 mb-1">Join Our Community</p>
            <p className="text-sm text-purple-700">
              Thousands of fashion lovers buying and selling every day
            </p>
          </CardContent>
        </Card>
      </div>
    )
  },
  {
    title: "You're All Set!",
    subtitle: "Start exploring Threadly now",
    content: (
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-xl font-semibold">Welcome to Threadly!</h3>
          <p className="text-muted-foreground">Choose how you'd like to start</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold">Start Shopping</h4>
                <p className="text-sm text-muted-foreground">
                  Browse thousands of unique fashion items
                </p>
                <Button className="w-full" variant="outline">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Browse Items
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold">List Your First Item</h4>
                <p className="text-sm text-muted-foreground">
                  Turn your fashion into cash in minutes
                </p>
                <Button className="w-full" variant="outline">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Start Selling
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            You can always switch between buying and selling in your dashboard
          </p>
        </div>
      </div>
    )
  }
];