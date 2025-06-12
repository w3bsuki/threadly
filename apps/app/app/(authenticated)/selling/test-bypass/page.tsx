'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { testBypassProductCreation } from './actions/test-bypass-create';

export default function TestBypassPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await testBypassProductCreation(formData);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Selling Flow Debug Test</CardTitle>
          <p className="text-sm text-muted-foreground">Testing core product creation bypassing Stripe</p>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Product Title</label>
              <Input
                id="title"
                name="title"
                defaultValue="Test Product"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                name="description"
                defaultValue="This is a test product to verify selling works"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">Price ($)</label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue="25.99"
                required
              />
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing Selling Flow...' : '🚀 Test Create Product (Server Action)'}
            </Button>
          </form>

          {result && (
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-lg bg-gray-100">
                <h3 className="font-bold mb-2">
                  Result: {result.success ? '✅ SUCCESS - SELLING WORKS!' : '❌ Failed'}
                </h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}