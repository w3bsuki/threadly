'use client';

import { useState } from 'react';
import { useCSRF } from '@/lib/hooks/use-csrf';

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
      setResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      setResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
      setResult(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="font-bold text-xl">CSRF Protection Examples</h2>

      <div className="space-y-2">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-background hover:bg-blue-600"
          onClick={handleTestAPI}
        >
          Test API with fetchWithCSRF
        </button>

        <button
          className="ml-2 rounded bg-green-500 px-4 py-2 text-background hover:bg-green-600"
          onClick={handleManualAPI}
        >
          Test API with manual headers
        </button>
      </div>

      <form className="space-y-2" onSubmit={handleFormSubmit}>
        <input
          className="rounded border px-3 py-2"
          name="title"
          placeholder="Product title"
          required
        />
        <button
          className="rounded bg-purple-500 px-4 py-2 text-background hover:bg-purple-600"
          type="submit"
        >
          Submit Form with CSRF
        </button>
      </form>

      {result && (
        <pre className="mt-4 overflow-auto rounded bg-secondary p-4">
          {result}
        </pre>
      )}
    </div>
  );
}
