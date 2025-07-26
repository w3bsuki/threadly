'use client';

import { useCallback, useState } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'fixed' | 'exponential' | 'linear';
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryMechanism {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    maxDelay: 10000,
    retryCondition: (error: Error) => true,
    onRetry: () => {}
  };

  static async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === config.maxAttempts || !config.retryCondition(lastError)) {
          throw lastError;
        }
        
        config.onRetry(attempt, lastError);
        
        const delay = this.calculateDelay(attempt, config);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private static calculateDelay(attempt: number, config: Required<RetryOptions>): number {
    let delay: number;
    
    switch (config.backoff) {
      case 'fixed':
        delay = config.delay;
        break;
      case 'linear':
        delay = config.delay * attempt;
        break;
      case 'exponential':
      default:
        delay = config.delay * Math.pow(2, attempt - 1);
        break;
    }
    
    return Math.min(delay, config.maxDelay);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function useRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    setAttemptCount(0);

    try {
      const result = await RetryMechanism.execute(operation, {
        ...options,
        onRetry: (attempt, error) => {
          setAttemptCount(attempt);
          options.onRetry?.(attempt, error);
        }
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsRetrying(false);
    }
  }, [operation, options]);

  return {
    execute,
    isRetrying,
    attemptCount,
    error
  };
}

export function retryConditions() {
  return {
    networkError: (error: Error) => {
      const networkErrorMessages = ['NetworkError', 'Failed to fetch', 'fetch'];
      return networkErrorMessages.some(msg => error.message.includes(msg));
    },
    
    serverError: (error: Error) => {
      if ('status' in error && typeof (error as Record<string, unknown>).status === 'number') {
        const status = (error as Record<string, unknown>).status as number;
        return status >= 500 && status < 600;
      }
      return false;
    },
    
    timeoutError: (error: Error) => {
      return error.name === 'TimeoutError' || error.message.includes('timeout');
    },
    
    custom: (errorTypes: string[]) => (error: Error) => {
      return errorTypes.some(type => 
        error.name === type || error.message.includes(type)
      );
    }
  };
}

export function withRetry<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return RetryMechanism.execute(() => fn(...args), options);
  }) as T;
}