'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components';
import { RegionSelector } from '../../components/region-selector';
import { useCurrency } from '../../components/providers/currency-provider';
import { getCookie } from 'cookies-next';

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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Region Selector Demo</CardTitle>
          <CardDescription>
            Test the Zara-style region selector with multi-currency support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Settings */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Current Settings</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Region:</span> {savedRegion || 'Not selected'}</p>
              <p><span className="font-medium">Language:</span> {savedLanguage || 'Not selected'}</p>
              <p><span className="font-medium">Currency:</span> {currency}</p>
            </div>
          </div>

          {/* Demo Actions */}
          <div className="space-y-4">
            <Button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto"
            >
              Open Region Selector
            </Button>

            <RegionSelector
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          </div>

          {/* Price Examples */}
          <div>
            <h3 className="font-semibold mb-3">Price Display Examples</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoProducts.map((product) => (
                <div key={product.name} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-lg font-bold mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Features Implemented</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
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