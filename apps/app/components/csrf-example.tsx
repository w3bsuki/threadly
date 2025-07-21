'use client';

import { useCSRF } from '@/lib/hooks/use-csrf';
import { useState } from 'react';

/**
 * Example component demonstrating CSRF-protected API calls
 */
export function CSRFExample(): React.JSX.Element {
  const { fetchWithCSRF, getCSRFHeaders } = useCSRF();
  const [result, setResult] = useState<string>('');

  const handleTestAPI = async () => {
    try {
      // Example 1: Using fetchWithCSRF wrapper
      const response = await fetchWithCSRF('/api/test', {
        method: 'POST',
        body: JSON.stringify({ message: 'Test with CSRF protection' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleManualAPI = async () => {
    try {
      // Example 2: Using getCSRFHeaders manually
      const response = await fetch('/api/test', {
        method: 'POST',
        body: JSON.stringify({ message: 'Manual CSRF header test' }),
        headers: getCSRFHeaders({
          'Content-Type': 'application/json',
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    try {
      // Example 3: Using CSRF with FormData
      const response = await fetchWithCSRF('/api/products', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">CSRF Protection Examples</h2>
      
      <div className="space-y-2">
        <button
          onClick={handleTestAPI}
          className="px-4 py-2 bg-blue-500 text-background rounded hover:bg-blue-600"
        >
          Test API with fetchWithCSRF
        </button>
        
        <button
          onClick={handleManualAPI}
          className="px-4 py-2 bg-green-500 text-background rounded hover:bg-green-600 ml-2"
        >
          Test API with manual headers
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-2">
        <input
          name="title"
          placeholder="Product title"
          className="px-3 py-2 border rounded"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-500 text-background rounded hover:bg-purple-600"
        >
          Submit Form with CSRF
        </button>
      </form>

      {result && (
        <pre className="mt-4 p-4 bg-secondary rounded overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}