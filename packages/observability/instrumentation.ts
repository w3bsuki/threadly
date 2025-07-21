import { init } from '@sentry/nextjs';
import { keys } from './keys';

const env = keys();

const baseConfig = {
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
  release: env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Performance monitoring
  tracesSampleRate: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Enhanced error capture
  beforeSend(event: any, hint: any) {
    // Filter out known non-critical errors
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message).toLowerCase();
      
      // Filter out network errors that are often user-related
      if (
        message.includes('network error') ||
        message.includes('fetch failed') ||
        message.includes('load failed') ||
        message.includes('aborted')
      ) {
        return null;
      }
      
      // Filter out cancelled requests
      if (message.includes('cancel') || message.includes('abort')) {
        return null;
      }
    }
    
    return event;
  },
  
  // User privacy
  sendDefaultPii: false,
  
  // Debug in development
  debug: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'development',
  
  // Integration configuration
  integrations: [
    // Add custom integrations here if needed
  ],
  
  // Tag events with deployment info
  tags: {
    runtime: typeof window !== 'undefined' ? 'client' : 'server'
  }
};

const nodeConfig = {
  ...baseConfig,
  
  // Server-specific configuration
  beforeSend(event: any, hint: any) {
    // Apply base filtering
    const filteredEvent = baseConfig.beforeSend?.(event, hint);
    if (!filteredEvent) return null;
    
    // Additional server-side filtering
    if (event.exception) {
      const error = hint.originalException;
      
      // Filter out database connection timeouts (often temporary)
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
          return null;
        }
      }
    }
    
    return filteredEvent;
  },
  
  // Additional server tags
  tags: {
    ...baseConfig.tags,
    runtime: 'server'
  }
};

const edgeConfig = {
  ...baseConfig,
  
  // Edge runtime has memory constraints
  tracesSampleRate: 0.05,
  
  tags: {
    ...baseConfig.tags,
    runtime: 'edge'
  }
};

export const initializeSentry = () => {
  // Only initialize if DSN is provided
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }
  
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    init(nodeConfig);
  } else if (process.env.NEXT_RUNTIME === 'edge') {
    init(edgeConfig);
  } else {
    // Client-side initialization
    init(baseConfig);
  }
};
