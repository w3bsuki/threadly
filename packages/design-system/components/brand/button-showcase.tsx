'use client';

import { Button } from '../ui/button';
import { Heart, ShoppingCart, Star, Users, Package, CreditCard } from 'lucide-react';

export function BrandButtonShowcase() {
  return (
    <div className="space-y-8 p-6 bg-background">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Threadly Brand Buttons</h2>
        <p className="text-muted-foreground">Brand-specific button variants for the Threadly marketplace</p>
      </div>

      {/* Primary Brand Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Primary Brand Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-primary" size="lg">
            <ShoppingCart className="mr-2" />
            Add to Cart
          </Button>
          <Button variant="brand-primary">
            <Heart className="mr-2" />
            Add to Favorites
          </Button>
          <Button variant="brand-primary" size="sm">
            Follow Seller
          </Button>
        </div>
      </div>

      {/* Secondary Brand Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Secondary Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-secondary" size="lg">
            <Package className="mr-2" />
            List Item
          </Button>
          <Button variant="brand-secondary">
            <Users className="mr-2" />
            Join Community
          </Button>
          <Button variant="brand-secondary" size="sm">
            Share Product
          </Button>
        </div>
      </div>

      {/* Accent Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Accent Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-accent" size="lg">
            <Star className="mr-2" />
            Rate & Review
          </Button>
          <Button variant="brand-accent">
            <CreditCard className="mr-2" />
            Quick Buy
          </Button>
          <Button variant="brand-accent" size="sm">
            Get Notified
          </Button>
        </div>
      </div>

      {/* Premium Gradient Action */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Premium Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-gradient" size="lg">
            <Star className="mr-2" />
            Become Premium Seller
          </Button>
          <Button variant="brand-gradient">
            Unlock Premium Features
          </Button>
        </div>
      </div>

      {/* Outline & Ghost Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Subtle Brand Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-outline" size="lg">
            Learn More
          </Button>
          <Button variant="brand-outline">
            Browse Collection
          </Button>
          <Button variant="brand-outline" size="sm">
            View Details
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="brand-ghost">
            Cancel
          </Button>
          <Button variant="brand-ghost" size="sm">
            Skip
          </Button>
        </div>
      </div>

      {/* Size Variations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Size Variations</h3>
        <div className="flex items-center gap-4">
          <Button variant="brand-primary" size="sm">Small</Button>
          <Button variant="brand-primary" size="default">Default</Button>
          <Button variant="brand-primary" size="lg">Large</Button>
          <Button variant="brand-primary" size="icon">
            <Heart />
          </Button>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Real-World Usage Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Product Card Example */}
          <div className="p-4 border border-border rounded-[var(--radius-lg)] space-y-3">
            <div className="h-32 bg-muted rounded-[var(--radius-md)]"></div>
            <h4 className="font-medium">Vintage Denim Jacket</h4>
            <p className="text-2xl font-bold text-[oklch(var(--brand-primary))]">$89</p>
            <div className="space-y-2">
              <Button variant="brand-primary" className="w-full">
                <ShoppingCart className="mr-2" />
                Add to Cart
              </Button>
              <div className="flex gap-2">
                <Button variant="brand-ghost" size="sm" className="flex-1">
                  <Heart />
                </Button>
                <Button variant="brand-outline" size="sm" className="flex-1">
                  Quick View
                </Button>
              </div>
            </div>
          </div>

          {/* Seller Profile Example */}
          <div className="p-4 border border-border rounded-[var(--radius-lg)] space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-[var(--radius-full)]"></div>
              <div>
                <h4 className="font-medium">Fashion Seller</h4>
                <p className="text-sm text-muted-foreground">⭐ 4.9 (234 reviews)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="brand-secondary" className="w-full">
                <Users className="mr-2" />
                Follow
              </Button>
              <Button variant="brand-outline" className="w-full">
                View Profile
              </Button>
            </div>
          </div>

          {/* Premium Feature Example */}
          <div className="p-4 border border-border rounded-[var(--radius-lg)] space-y-3">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-[oklch(var(--brand-primary))] to-[oklch(var(--brand-accent))] rounded-[var(--radius-full)] mx-auto flex items-center justify-center">
                <Star className="text-background" />
              </div>
              <h4 className="font-medium">Premium Membership</h4>
              <p className="text-sm text-muted-foreground">Unlock exclusive features</p>
            </div>
            <Button variant="brand-gradient" className="w-full">
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