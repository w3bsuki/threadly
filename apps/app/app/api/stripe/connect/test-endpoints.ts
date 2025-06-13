// Test file for Stripe Connect endpoints
// This file is for testing purposes only and should not be deployed to production

import { headers } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  data: any;
  error?: string;
}

// Helper to make authenticated requests
async function makeAuthenticatedRequest(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        // In a real test, you'd need to pass actual auth headers
        // For now, this is a placeholder
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    return {
      endpoint,
      method,
      status: response.status,
      data,
      error: response.ok ? undefined : data.error,
    };
  } catch (error) {
    return {
      endpoint,
      method,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function testStripeConnectEndpoints() {
  const results: TestResult[] = [];

  // Test 1: Create onboarding link
  const onboardingResult = await makeAuthenticatedRequest(
    '/api/stripe/connect/onboarding',
    'POST'
  );
  results.push(onboardingResult);

  // Test 2: Check account status
  const statusResult = await makeAuthenticatedRequest(
    '/api/stripe/connect/status',
    'GET'
  );
  results.push(statusResult);

  // Test 3: Get dashboard link (will fail if not onboarded)
  const dashboardResult = await makeAuthenticatedRequest(
    '/api/stripe/connect/dashboard',
    'POST'
  );
  results.push(dashboardResult);

  // Test 4: Check dashboard access
  const dashboardCheckResult = await makeAuthenticatedRequest(
    '/api/stripe/connect/dashboard',
    'GET'
  );
  results.push(dashboardCheckResult);

  // Test 5: Refresh onboarding link
  const refreshResult = await makeAuthenticatedRequest(
    '/api/stripe/connect/onboarding',
    'GET'
  );
  results.push(refreshResult);

  return results;
}

// Example usage in a test route or component:
/*
import { testStripeConnectEndpoints } from './test-endpoints';

export async function GET() {
  const results = await testStripeConnectEndpoints();
  return Response.json({ results });
}
*/