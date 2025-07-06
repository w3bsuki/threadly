import arcjet, { tokenBucket, fixedWindow } from '@arcjet/next';
import { keys } from './keys';
import { NextResponse } from 'next/server';

// Lazy load the Arcjet key to avoid initialization errors
let arcjetKey: string | undefined;
try {
  arcjetKey = keys().ARCJET_KEY;
} catch (error) {
}

// Mock rate limiter for when Arcjet is not configured
const mockRateLimiter = {
  protect: async () => ({
    isDenied: () => false,
    isAllowed: () => true,
    reason: null,
  }),
};

// Lazy initialization of rate limiters
let _generalApiLimit: any;
let _authRateLimit: any;
let _paymentRateLimit: any;
let _uploadRateLimit: any;
let _messageRateLimit: any;
let _webhookRateLimit: any;

// Initialize Arcjet instance only when needed
const getArcjet = () => {
  if (!arcjetKey) {
    return null;
  }
  
  try {
    return arcjet({
      key: arcjetKey,
      rules: [], // Add rate limit rules as needed
      characteristics: ['ip.src'],
    });
  } catch (error) {
    return null;
  }
};

// General API rate limit: 100 requests per minute
export const generalApiLimit = {
  protect: async (request: Request) => {
    if (!_generalApiLimit) {
      const aj = getArcjet();
      if (!aj) return mockRateLimiter.protect();
      
      _generalApiLimit = aj.withRule(
        tokenBucket({
          mode: 'LIVE',
          refillRate: 100,
          interval: 60,
          capacity: 100,
        })
      );
    }
    return _generalApiLimit.protect(request);
  },
};

// Auth rate limit: 10 requests per minute
export const authRateLimit = {
  protect: async (request: Request) => {
    if (!_authRateLimit) {
      const aj = getArcjet();
      if (!aj) return mockRateLimiter.protect();
      
      _authRateLimit = aj.withRule(
        fixedWindow({
          mode: 'LIVE',
          window: '1m',
          max: 10,
        })
      );
    }
    return _authRateLimit.protect(request);
  },
};

// Payment rate limit: 20 requests per minute
export const paymentRateLimit = {
  protect: async (request: Request) => {
    if (!_paymentRateLimit) {
      const aj = getArcjet();
      if (!aj) return mockRateLimiter.protect();
      
      _paymentRateLimit = aj.withRule(
        tokenBucket({
          mode: 'LIVE',
          refillRate: 20,
          interval: 60,
          capacity: 20,
        })
      );
    }
    return _paymentRateLimit.protect(request);
  },
};

// Upload rate limit: 10 requests per minute
export const uploadRateLimit = {
  protect: async (request: Request) => {
    if (!_uploadRateLimit) {
      const aj = getArcjet();
      if (!aj) return mockRateLimiter.protect();
      
      _uploadRateLimit = aj.withRule(
        fixedWindow({
          mode: 'LIVE',
          window: '1m',
          max: 10,
        })
      );
    }
    return _uploadRateLimit.protect(request);
  },
};

// Message rate limit: 30 requests per minute
export const messageRateLimit = {
  protect: async (request: Request) => {
    if (!_messageRateLimit) {
      const aj = getArcjet();
      if (!aj) return mockRateLimiter.protect();
      
      _messageRateLimit = aj.withRule(
        tokenBucket({
          mode: 'LIVE',
          refillRate: 30,
          interval: 60,
          capacity: 30,
        })
      );
    }
    return _messageRateLimit.protect(request);
  },
};

// Webhook rate limit: 5 requests per minute (strict for security)
export const webhookRateLimit = {
  protect: async (request: Request) => {
    if (!_webhookRateLimit) {
      const aj = getArcjet();
      if (!aj) return mockRateLimiter.protect();
      
      _webhookRateLimit = aj.withRule(
        fixedWindow({
          mode: 'LIVE',
          window: '1m',
          max: 5,
        })
      );
    }
    return _webhookRateLimit.protect(request);
  },
};

// Helper function to handle rate limit responses
export async function checkRateLimit(
  rateLimiter: any,
  request: Request
) {
  if (!arcjetKey) {
    // If no Arcjet key is configured, allow the request
    return { allowed: true, decision: null };
  }

  try {
    const decision = await rateLimiter.protect(request);

    if (decision.isDenied()) {
      
      // Get rate limit headers for the response
      const headers = new Headers();
      
      if (decision.reason?.isRateLimit?.()) {
        // Add standard rate limit headers
        const rateLimit = decision.reason;
        headers.set('X-RateLimit-Limit', rateLimit.max?.toString() || '0');
        headers.set('X-RateLimit-Remaining', Math.max(0, rateLimit.remaining || 0).toString());
        
        if (rateLimit.reset) {
          headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
          const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);
          headers.set('Retry-After', Math.max(1, retryAfter).toString());
        }
      }

      return {
        allowed: false,
        decision,
        headers,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        }
      };
    }

    return { allowed: true, decision };
  } catch (error) {
    // On error, allow the request to proceed
    return { allowed: true, decision: null };
  }
}

// Export types for TypeScript support
export type RateLimitResult = Awaited<ReturnType<typeof checkRateLimit>>;

// Export a rate limit response helper
export function rateLimitResponse(result: RateLimitResult) {
  if (!result.allowed) {
    return new NextResponse(
      JSON.stringify({
        error: result.error?.message || 'Rate limit exceeded',
        code: result.error?.code || 'RATE_LIMIT_EXCEEDED',
      }),
      {
        status: 429,
        headers: result.headers,
      }
    );
  }
  return null;
}