import type { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | false;
  crossOriginEmbedderPolicy?: string | false;
  crossOriginOpenerPolicy?: string | false;
  crossOriginResourcePolicy?: string | false;
  originAgentCluster?: string | false;
  referrerPolicy?: string | false;
  strictTransportSecurity?: string | false;
  xContentTypeOptions?: string | false;
  xDnsPrefetchControl?: string | false;
  xDownloadOptions?: string | false;
  xFrameOptions?: string | false;
  xPermittedCrossDomainPolicies?: string | false;
  xXssProtection?: string | false;
  permissionsPolicy?: string | false;
}

export const defaultSecurityHeaders: SecurityHeadersConfig = {
  contentSecurityPolicy: [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  crossOriginEmbedderPolicy: 'require-corp',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'cross-origin',
  originAgentCluster: '?1',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xContentTypeOptions: 'nosniff',
  xDnsPrefetchControl: 'on',
  xDownloadOptions: 'noopen',
  xFrameOptions: 'DENY',
  xPermittedCrossDomainPolicies: 'none',
  xXssProtection: '0',
  permissionsPolicy: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
  ].join(', '),
};

export const apiSecurityHeaders: SecurityHeadersConfig = {
  ...defaultSecurityHeaders,
  contentSecurityPolicy: false,
  xFrameOptions: false,
};

export class SecurityHeaders {
  constructor(private config: SecurityHeadersConfig = defaultSecurityHeaders) {}

  apply(response: NextResponse): NextResponse {
    const headers = response.headers;

    if (this.config.contentSecurityPolicy !== false) {
      headers.set('Content-Security-Policy', this.config.contentSecurityPolicy);
    }

    if (this.config.crossOriginEmbedderPolicy !== false) {
      headers.set(
        'Cross-Origin-Embedder-Policy',
        this.config.crossOriginEmbedderPolicy
      );
    }

    if (this.config.crossOriginOpenerPolicy !== false) {
      headers.set(
        'Cross-Origin-Opener-Policy',
        this.config.crossOriginOpenerPolicy
      );
    }

    if (this.config.crossOriginResourcePolicy !== false) {
      headers.set(
        'Cross-Origin-Resource-Policy',
        this.config.crossOriginResourcePolicy
      );
    }

    if (this.config.originAgentCluster !== false) {
      headers.set('Origin-Agent-Cluster', this.config.originAgentCluster);
    }

    if (this.config.referrerPolicy !== false) {
      headers.set('Referrer-Policy', this.config.referrerPolicy);
    }

    if (this.config.strictTransportSecurity !== false) {
      headers.set(
        'Strict-Transport-Security',
        this.config.strictTransportSecurity
      );
    }

    if (this.config.xContentTypeOptions !== false) {
      headers.set('X-Content-Type-Options', this.config.xContentTypeOptions);
    }

    if (this.config.xDnsPrefetchControl !== false) {
      headers.set('X-DNS-Prefetch-Control', this.config.xDnsPrefetchControl);
    }

    if (this.config.xDownloadOptions !== false) {
      headers.set('X-Download-Options', this.config.xDownloadOptions);
    }

    if (this.config.xFrameOptions !== false) {
      headers.set('X-Frame-Options', this.config.xFrameOptions);
    }

    if (this.config.xPermittedCrossDomainPolicies !== false) {
      headers.set(
        'X-Permitted-Cross-Domain-Policies',
        this.config.xPermittedCrossDomainPolicies
      );
    }

    if (this.config.xXssProtection !== false) {
      headers.set('X-XSS-Protection', this.config.xXssProtection);
    }

    if (this.config.permissionsPolicy !== false) {
      headers.set('Permissions-Policy', this.config.permissionsPolicy);
    }

    return response;
  }

  middleware(
    req: NextRequest,
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    return next().then((response) => this.apply(response));
  }
}

export const withSecurityHeaders = (
  handler: (req: NextRequest, params: any) => Promise<NextResponse>,
  config: SecurityHeadersConfig = defaultSecurityHeaders
) => {
  const security = new SecurityHeaders(config);

  return async (req: NextRequest, params: any): Promise<NextResponse> => {
    const response = await handler(req, params);
    return security.apply(response);
  };
};

export const createSecurityMiddleware = (
  config: SecurityHeadersConfig = defaultSecurityHeaders
) => {
  const security = new SecurityHeaders(config);

  return (req: NextRequest, next: () => Promise<NextResponse>) => {
    return security.middleware(req, next);
  };
};

export const corsHeaders = (
  options: {
    origin?: string | string[] | ((origin: string) => boolean);
    credentials?: boolean;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    maxAge?: number;
  } = {}
) => {
  const {
    origin = '*',
    credentials = true,
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-API-Version'],
    exposedHeaders = [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge = 86_400,
  } = options;

  return (req: NextRequest, response: NextResponse): NextResponse => {
    const requestOrigin = req.headers.get('origin') || '';

    if (typeof origin === 'function') {
      if (origin(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        response.headers.set('Access-Control-Allow-Origin', requestOrigin);
      }
    } else {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    if (credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    response.headers.set('Access-Control-Allow-Methods', methods.join(', '));
    response.headers.set(
      'Access-Control-Allow-Headers',
      allowedHeaders.join(', ')
    );
    response.headers.set(
      'Access-Control-Expose-Headers',
      exposedHeaders.join(', ')
    );
    response.headers.set('Access-Control-Max-Age', maxAge.toString());

    return response;
  };
};
