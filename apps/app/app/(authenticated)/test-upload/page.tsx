'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Textarea } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';

export default function TestUploadPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const productData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseInt(formData.get('price') as string) * 100, // Convert to cents
      categoryId: 'test-category-id',
      condition: 'GOOD' as const,
      brand: formData.get('brand') as string || undefined,
      size: formData.get('size') as string || undefined,
      color: formData.get('color') as string || undefined,
      images: ['https://via.placeholder.com/400x400'], // Test image
      sellerId: 'test-seller-id'
    };

    try {
      // Test 1: Try the minimal action
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });

      const testResult = await response.text();
      
      setResult({
        success: response.ok,
        status: response.status,
        response: testResult,
        productData: productData
      });

    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        productData: productData
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Product Upload</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>API URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</div>
            <div>App URL: {process.env.NEXT_PUBLIC_APP_URL || 'NOT SET'}</div>
            <div>Clerk Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}</div>
            <div>UploadThing: {process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID ? 'SET' : 'NOT SET'}</div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="title" placeholder="Product Title" required />
        <Textarea name="description" placeholder="Product Description" required />
        <Input name="price" type="number" placeholder="Price (dollars)" required />
        <Input name="brand" placeholder="Brand (optional)" />
        <Input name="size" placeholder="Size (optional)" />
        <Input name="color" placeholder="Color (optional)" />
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Testing...' : 'Test Upload'}
        </Button>
      </form>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}