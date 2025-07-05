'use client';

import { useState } from 'react';
import { testFullProductCreation } from '../actions/test-full-create';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';

export default function TestCreationPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await testFullProductCreation();
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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Product Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Create Product'}
          </Button>

          {result && (
            <div className="mt-4 p-4 rounded-lg bg-gray-100">
              <h3 className="font-bold mb-2">
                Result: {result.success ? '✅ Success' : '❌ Failed'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}