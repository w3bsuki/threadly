import { searchIndexing } from '@repo/search/search-webhook-client';
import { env } from '@/env';
import { logError } from '@repo/observability/server';

// Initialize search webhook client
const initializeSearch = () => {
  try {
    // Determine the base URL for the API
    const baseUrl = env.VERCEL_URL 
      ? `https://${env.VERCEL_URL}`
      : env.NEXT_PUBLIC_API_URL 
      ? env.NEXT_PUBLIC_API_URL
      : 'http://localhost:3002';

    searchIndexing.init(baseUrl);
    
  } catch (error) {
    logError('Failed to initialize search indexing client:', error);
  }
};

// Initialize immediately when this module is imported
initializeSearch();

export { searchIndexing };