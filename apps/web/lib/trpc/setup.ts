import { logMigrationStatus } from '@repo/api/utils/api/trpc';

// Initialize tRPC migration logging in development
export function initializeTRPCMigration() {
  if (process.env.NODE_ENV === 'development') {
    logMigrationStatus();
    
    // Log configuration on startup
    console.group('🌐 Web App tRPC Configuration');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');
    console.log('Features:', process.env.NEXT_PUBLIC_TRPC_FEATURES || 'none');
    console.log('DevTools:', process.env.NODE_ENV === 'development');
    console.groupEnd();
  }
}

// Call this in your app initialization
initializeTRPCMigration();