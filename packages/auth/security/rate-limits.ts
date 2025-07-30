import { type NextRequest } from 'next/server';
import { RateLimiter, type RateLimitConfig } from '@repo/api/utils';

// Rate limit configurations for different API endpoints
export const generalApiLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  message: 'Too many API requests, please try again later',
};

export const messageRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many message requests, please try again later',
};

export const webhookRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Too many webhook requests',
};

export const paymentRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: 'Too many payment attempts, please try again later',
};

export const authRateLimit: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later',
};

// Store instances for each rate limiter
const rateLimiters = new Map<string, RateLimiter>();

// Get or create a rate limiter instance
function getRateLimiter(config: RateLimitConfig): RateLimiter {
  const key = `${config.windowMs}-${config.maxRequests}`;
  
  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, new RateLimiter(config));
  }
  
  return rateLimiters.get(key)!;
}

// Check rate limit function
export async function checkRateLimit(
  config: RateLimitConfig,
  request: NextRequest
): Promise<{
  allowed: boolean;
  error?: { message: string; code: string };
  headers?: Headers;
}> {
  try {
    const limiter = getRateLimiter(config);
    
    // Create a dummy next function that just returns a success response
    const dummyNext = async () => new Response('OK', { status: 200 });
    
    // Try to execute the rate limiter middleware
    const response = await limiter.middleware(request, dummyNext);
    
    // If we get a response with headers, extract them
    const headers = new Headers();
    if (response.headers.has('X-RateLimit-Limit')) {
      headers.set('X-RateLimit-Limit', response.headers.get('X-RateLimit-Limit')!);
    }
    if (response.headers.has('X-RateLimit-Remaining')) {
      headers.set('X-RateLimit-Remaining', response.headers.get('X-RateLimit-Remaining')!);
    }
    if (response.headers.has('X-RateLimit-Reset')) {
      headers.set('X-RateLimit-Reset', response.headers.get('X-RateLimit-Reset')!);
    }
    if (response.headers.has('Retry-After')) {
      headers.set('Retry-After', response.headers.get('Retry-After')!);
    }
    
    return {
      allowed: true,
      headers,
    };
  } catch (error: any) {
    // If the rate limiter throws an error, it means rate limit exceeded
    if (error.name === 'ApiError' && error.statusCode === 429) {
      const headers = new Headers();
      const retryAfter = error.headers?.['Retry-After'] || '60';
      headers.set('Retry-After', retryAfter);
      headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      headers.set('X-RateLimit-Remaining', '0');
      
      return {
        allowed: false,
        error: {
          message: error.message || config.message || 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        headers,
      };
    }
    
    // For any other error, allow the request but log the error
    console.error('Rate limit check error:', error);
    return { allowed: true };
  }
}

// Helper function to create a rate-limited handler
export function withRateLimit<T extends (...args: any[]) => Promise<Response>>(
  handler: T,
  config: RateLimitConfig = generalApiLimit
): T {
  return (async (request: NextRequest, ...args: any[]) => {
    const rateLimitResult = await checkRateLimit(config, request);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
          code: rateLimitResult.error?.code || 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(rateLimitResult.headers?.entries() || []),
          },
        }
      );
    }
    
    const response = await handler(request, ...args);
    
    // Add rate limit headers to successful responses
    if (rateLimitResult.headers) {
      rateLimitResult.headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  }) as T;
}