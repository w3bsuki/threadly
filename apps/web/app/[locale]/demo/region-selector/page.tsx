'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components';
import { getCookie } from 'cookies-next';
import { useState } from 'react';
import { useCurrency } from '../../components/providers/currency-provider';
import { RegionSelector } from '../../components/region-selector';

export default function RegionSelectorDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, formatPrice } = useCurrency();

  const demoProducts = [
    { name: 'Designer Jacket', price: 299.99 },
    { name: 'Premium T-Shirt', price: 49.99 },
    { name: 'Classic Jeans', price: 89.99 },
    { name: 'Leather Shoes', price: 199.99 },
  ];

  const savedRegion = getCookie('preferredRegion');
  const savedLanguage = getCookie('preferredLanguage');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Region Selector Demo</CardTitle>
          <CardDescription>
            Test the Zara-style region selector with multi-currency support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Settings */}
          <div className="rounded-[var(--radius-lg)] border bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">Current Settings</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Region:</span>{' '}
                {savedRegion || 'Not selected'}
              </p>
              <p>
                <span className="font-medium">Language:</span>{' '}
                {savedLanguage || 'Not selected'}
              </p>
              <p>
                <span className="font-medium">Currency:</span> {currency}
              </p>
            </div>
          </div>

          {/* Demo Actions */}
          <div className="space-y-4">
            <Button
              className="w-full sm:w-auto"
              onClick={() => setIsOpen(true)}
            >
              Open Region Selector
            </Button>

            <RegionSelector isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>

          {/* Price Examples */}
          <div>
            <h3 className="mb-3 font-semibold">Price Display Examples</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {demoProducts.map((product) => (
                <div
                  className="rounded-[var(--radius-lg)] border p-3"
                  key={product.name}
                >
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="mt-1 font-bold text-lg">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="rounded-[var(--radius-lg)] border p-4">
            <h3 className="mb-2 font-semibold">Features Implemented</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>✓ Bulgarian (BGN) and Ukrainian (UAH) currency support</li>
              <li>✓ Geo-detection for automatic region suggestion</li>
              <li>✓ Cookie persistence for user preferences</li>
              <li>✓ Language switching integration</li>
              <li>✓ Elegant Zara-style modal design</li>
              <li>✓ Mobile-responsive layout</li>
              <li>✓ Currency formatting with proper symbols</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
