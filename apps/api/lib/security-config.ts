import type { NextRequest } from 'next/server';

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined): boolean => {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
      'https://threadly.vercel.app',
      'https://app.threadly.vercel.app',
    ];
    
    // Allow requests with no origin (e.g., mobile apps)
    if (!origin) return true;
    
    return allowedOrigins.includes(origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  maxAge: 86400, // 24 hours
};

// Security headers configuration
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';",
};

// Helper to get client IP from request
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default value if no IP is found
  return '127.0.0.1';
}

// Helper to check if request is from allowed origin
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Allow requests with no origin
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
    'https://threadly.vercel.app',
    'https://app.threadly.vercel.app',
  ];
  
  return allowedOrigins.includes(origin);
}