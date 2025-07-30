// Temporary stub for tRPC client while resolving import issues
export const trpc = {
  useUtils: () => ({}),
  // Add other commonly used methods as needed
};

// Create vanilla client for server-side usage in web app
export function createWebTRPCClient() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  // Return stub client for now
  return {};
}

// Web-specific tRPC utilities
export function getWebTRPCConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
    enableDevtools: process.env.NODE_ENV === 'development',
  };
}