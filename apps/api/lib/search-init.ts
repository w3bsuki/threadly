import { searchIndexing } from '@repo/search/search-webhook-client';
import { env } from '@/env';

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
    
    console.log('Search indexing client initialized with base URL:', baseUrl);
  } catch (error) {
    console.warn('Failed to initialize search indexing client:', error);
  }
};

// Initialize immediately when this module is imported
initializeSearch();

export { searchIndexing };