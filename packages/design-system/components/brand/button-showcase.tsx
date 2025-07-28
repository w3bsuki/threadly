'use client';

import {
  CreditCard,
  Heart,
  Package,
  ShoppingCart,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '../ui/button';

export function BrandButtonShowcase() {
  return (
    <div className="space-y-8 bg-background p-6">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-2xl text-foreground">
          Threadly Brand Buttons
        </h2>
        <p className="text-muted-foreground">
          Brand-specific button variants for the Threadly marketplace
        </p>
      </div>

      {/* Primary Brand Actions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Primary Brand Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="brand-primary">
            <ShoppingCart className="mr-2" />
            Add to Cart
          </Button>
          <Button variant="brand-primary">
            <Heart className="mr-2" />
            Add to Favorites
          </Button>
          <Button size="sm" variant="brand-primary">
            Follow Seller
          </Button>
        </div>
      </div>

      {/* Secondary Brand Actions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Secondary Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="brand-secondary">
            <Package className="mr-2" />
            List Item
          </Button>
          <Button variant="brand-secondary">
            <Users className="mr-2" />
            Join Community
          </Button>
          <Button size="sm" variant="brand-secondary">
            Share Product
          </Button>
        </div>
      </div>

      {/* Accent Actions */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Accent Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="brand-accent">
            <Star className="mr-2" />
            Rate & Review
          </Button>
          <Button variant="brand-accent">
            <CreditCard className="mr-2" />
            Quick Buy
          </Button>
          <Button size="sm" variant="brand-accent">
            Get Notified
          </Button>
        </div>
      </div>

      {/* Premium Gradient Action */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Premium Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="brand-gradient">
            <Star className="mr-2" />
            Become Premium Seller
          </Button>
          <Button variant="brand-gradient">Unlock Premium Features</Button>
        </div>
      </div>

      {/* Outline & Ghost Variants */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Subtle Brand Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="brand-outline">
            Learn More
          </Button>
          <Button variant="brand-outline">Browse Collection</Button>
          <Button size="sm" variant="brand-outline">
            View Details
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-ghost">Cancel</Button>
          <Button size="sm" variant="brand-ghost">
            Skip
          </Button>
        </div>
      </div>

      {/* Size Variations */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Size Variations
        </h3>
        <div className="flex items-center gap-4">
          <Button size="sm" variant="brand-primary">
            Small
          </Button>
          <Button size="default" variant="brand-primary">
            Default
          </Button>
          <Button size="lg" variant="brand-primary">
            Large
          </Button>
          <Button size="icon" variant="brand-primary">
            <Heart />
          </Button>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">
          Real-World Usage Examples
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Product Card Example */}
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-border p-4">
            <div className="h-32 rounded-[var(--radius-md)] bg-muted" />
            <h4 className="font-medium">Vintage Denim Jacket</h4>
            <p className="font-bold text-2xl text-[oklch(var(--brand-primary))]">
              $89
            </p>
            <div className="space-y-2">
              <Button className="w-full" variant="brand-primary">
                <ShoppingCart className="mr-2" />
                Add to Cart
              </Button>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm" variant="brand-ghost">
                  <Heart />
                </Button>
                <Button className="flex-1" size="sm" variant="brand-outline">
                  Quick View
                </Button>
              </div>
            </div>
          </div>

          {/* Seller Profile Example */}
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-[var(--radius-full)] bg-muted" />
              <div>
                <h4 className="font-medium">Fashion Seller</h4>
                <p className="text-muted-foreground text-sm">
                  ⭐ 4.9 (234 reviews)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full" variant="brand-secondary">
                <Users className="mr-2" />
                Follow
              </Button>
              <Button className="w-full" variant="brand-outline">
                View Profile
              </Button>
            </div>
          </div>

          {/* Premium Feature Example */}
          <div className="space-y-3 rounded-[var(--radius-lg)] border border-border p-4">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-full)] bg-gradient-to-r from-[oklch(var(--brand-primary))] to-[oklch(var(--brand-accent))]">
                <Star className="text-background" />
              </div>
              <h4 className="font-medium">Premium Membership</h4>
              <p className="text-muted-foreground text-sm">
                Unlock exclusive features
              </p>
            </div>
            <Button className="w-full" variant="brand-gradient">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Usage documentation
export const brandButtonExamples = {
  'Add to Cart': `<Button variant="brand-primary"><ShoppingCart className="mr-2" />Add to Cart</Button>`,
  'Follow Seller': `<Button variant="brand-secondary"><Users className="mr-2" />Follow</Button>`,
  'Quick Buy': `<Button variant="brand-accent"><CreditCard className="mr-2" />Quick Buy</Button>`,
  'Premium Action': `<Button variant="brand-gradient"><Star className="mr-2" />Become Premium</Button>`,
  'Learn More': `<Button variant="brand-outline">Learn More</Button>`,
  'Cancel Action': `<Button variant="brand-ghost">Cancel</Button>`,
};
