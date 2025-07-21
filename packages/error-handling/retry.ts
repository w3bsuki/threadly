import pRetry, { AbortError, type FailedAttemptError } from 'p-retry';
import { logError } from './error-logger';

export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
  randomize?: boolean;
  onFailedAttempt?: (error: FailedAttemptError) => void | Promise<void>;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 30000,
  factor: 2,
  randomize: true,
};

// Determine if an error is retryable
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return true;
  }
  
  // HTTP errors that are retryable
  if (error.status >= 500 || error.status === 429 || error.status === 408) {
    return true;
  }
  
  // Rate limit errors
  if (error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('too many requests')) {
    return true;
  }
  
  // Temporary failures
  if (error.message?.toLowerCase().includes('temporary') || error.message?.toLowerCase().includes('try again')) {
    return true;
  }
  
  return false;
}

// Retry wrapper for async functions
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return pRetry(
    async (attemptCount) => {
      try {
        return await fn();
      } catch (error) {
        // Check if we should retry this error
        if (options.shouldRetry && !options.shouldRetry(error)) {
          throw new AbortError(error as Error);
        }
        
        // Default retry logic
        if (!isRetryableError(error)) {
          throw new AbortError(error as Error);
        }
        
        // Log the retry attempt
        logError(error as Error, {
          level: 'warning',
          tags: { retry: 'true', attempt: attemptCount.toString() },
          extra: { options: mergedOptions },
        });
        
        throw error;
      }
    },
    {
      retries: mergedOptions.retries!,
      minTimeout: mergedOptions.minTimeout!,
      maxTimeout: mergedOptions.maxTimeout!,
      factor: mergedOptions.factor!,
      randomize: mergedOptions.randomize!,
      onFailedAttempt: async (error) => {
        if (mergedOptions.onFailedAttempt) {
          await mergedOptions.onFailedAttempt(error);
        }
        
        // Log failed attempts
        logError(error.message, {
          level: 'info',
          tags: { 
            retry: 'failed-attempt',
            attempt: error.attemptNumber.toString(),
            retriesLeft: error.retriesLeft.toString(),
          },
        });
      },
    }
  );
}

// Retry decorator for class methods
export function Retry(options: RetryOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), options);
    };
    
    return descriptor;
  };
}

// Batch retry for multiple operations
export async function withBatchRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions & { concurrency?: number } = {}
): Promise<Array<{ success: boolean; result?: T; error?: Error }>> {
  const { concurrency = 5, ...retryOptions } = options;
  
  const results = await Promise.all(
    operations.map(async (operation) => {
      try {
        const result = await withRetry(operation, retryOptions);
        return { success: true, result };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    })
  );
  
  return results;
}

// Create a retry-enabled fetch wrapper
export function createRetryFetch(defaultOptions?: RetryOptions) {
  return async function retryFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<Response> {
    return withRetry(
      async () => {
        const response = await fetch(input, init);
        
        // Check if response indicates a retryable error
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      },
      { ...defaultOptions, ...retryOptions }
    );
  };
}

// Export a default retry-enabled fetch
export const fetchWithRetry = createRetryFetch();