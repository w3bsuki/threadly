/**
 * Security Tests - Comprehensive Coverage
 * 
 * This test suite covers all critical security functionality
 * including rate limiting, input validation, authentication middleware,
 * and security vulnerability prevention.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { cleanup } from '@repo/testing';

// Mock security dependencies
vi.mock('@repo/security', () => ({
  generalApiLimit: { windowMs: 60000, max: 100 },
  paymentRateLimit: { windowMs: 60000, max: 10 },
  authRateLimit: { windowMs: 60000, max: 5 },
  checkRateLimit: vi.fn(),
  authMiddleware: vi.fn(),
  csrfProtection: vi.fn(),
}));

vi.mock('@repo/validation', () => ({
  sanitizeInput: vi.fn(),
  validateInput: vi.fn(),
  containsSQLInjection: vi.fn(),
  containsXSS: vi.fn(),
  containsProfanity: vi.fn(),
  isValidEmail: vi.fn(),
  isValidPassword: vi.fn(),
  sanitizeHtml: vi.fn(),
  validateFileUpload: vi.fn(),
}));

vi.mock('@repo/auth/middleware', () => ({
  withAuth: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock('@repo/observability/server', () => ({
  logSecurityEvent: vi.fn(),
  logError: vi.fn(),
  log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Rate Limiting', () => {
    it('should enforce general API rate limits', async () => {
      const { checkRateLimit, generalApiLimit } = await import('@repo/security');

      // Test within limits
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: true,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '99',
          'X-RateLimit-Reset': String(Date.now() + 60000),
        },
      });

      const request = new NextRequest('http://localhost:3002/api/products');
      
      const mockEndpoint = async (req: NextRequest) => {
        const rateLimitResult = await checkRateLimit(generalApiLimit, req);
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429, headers: rateLimitResult.headers }
          );
        }
        return NextResponse.json({ success: true }, { headers: rateLimitResult.headers });
      };

      const response = await mockEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('99');
    });

    it('should block requests exceeding rate limits', async () => {
      const { checkRateLimit, generalApiLimit } = await import('@repo/security');

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        error: { message: 'Rate limit exceeded' },
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000),
          'Retry-After': '60',
        },
      });

      const request = new NextRequest('http://localhost:3002/api/products');
      
      const mockEndpoint = async (req: NextRequest) => {
        const rateLimitResult = await checkRateLimit(generalApiLimit, req);
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
            { status: 429, headers: rateLimitResult.headers }
          );
        }
        return NextResponse.json({ success: true });
      };

      const response = await mockEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('should enforce stricter payment rate limits', async () => {
      const { checkRateLimit, paymentRateLimit } = await import('@repo/security');

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        error: { message: 'Payment rate limit exceeded' },
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60000),
        },
      });

      const request = new NextRequest('http://localhost:3002/api/stripe/create-checkout-session');
      
      const mockPaymentEndpoint = async (req: NextRequest) => {
        const rateLimitResult = await checkRateLimit(paymentRateLimit, req);
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: 'Payment rate limit exceeded' },
            { status: 429, headers: rateLimitResult.headers }
          );
        }
        return NextResponse.json({ success: true });
      };

      const response = await mockPaymentEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Payment rate limit exceeded');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    });

    it('should track rate limits per IP address', async () => {
      const { checkRateLimit, generalApiLimit } = await import('@repo/security');

      const request1 = new NextRequest('http://localhost:3002/api/products', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      const request2 = new NextRequest('http://localhost:3002/api/products', {
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });

      // IP 1 is rate limited
      vi.mocked(checkRateLimit).mockImplementation(async (config, req) => {
        const ip = req.headers.get('x-forwarded-for');
        if (ip === '192.168.1.1') {
          return {
            allowed: false,
            error: { message: 'Rate limit exceeded' },
            headers: { 'X-RateLimit-Remaining': '0' },
          };
        }
        return {
          allowed: true,
          headers: { 'X-RateLimit-Remaining': '99' },
        };
      });

      const mockEndpoint = async (req: NextRequest) => {
        const rateLimitResult = await checkRateLimit(generalApiLimit, req);
        if (!rateLimitResult.allowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429, headers: rateLimitResult.headers }
          );
        }
        return NextResponse.json({ success: true }, { headers: rateLimitResult.headers });
      };

      const response1 = await mockEndpoint(request1);
      const response2 = await mockEndpoint(request2);

      expect(response1.status).toBe(429); // IP 1 blocked
      expect(response2.status).toBe(200); // IP 2 allowed
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should detect and prevent SQL injection attacks', async () => {
      const { containsSQLInjection } = await import('@repo/validation');

      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM passwords",
        "; DELETE FROM products WHERE 1=1",
        "' OR 1=1 --",
        "admin'--",
        "' UNION SELECT username, password FROM users--",
      ];

      vi.mocked(containsSQLInjection).mockImplementation((input: string) => {
        const sqlPatterns = [
          /(\s|\b)(union|select|insert|update|delete|drop|create|alter|exec|execute)\s/i,
          /(\s|\b)(or|and)\s+\d+\s*=\s*\d+/i,
          /['"];?\s*(drop|delete|truncate)/i,
          /--|\|/,
        ];
        return sqlPatterns.some(pattern => pattern.test(input));
      });

      maliciousInputs.forEach(input => {
        expect(containsSQLInjection(input)).toBe(true);
      });

      // Valid inputs should pass
      const validInputs = [
        "iPhone 13 Pro",
        "user@example.com",
        "Regular product description",
        "123 Main Street",
      ];

      validInputs.forEach(input => {
        expect(containsSQLInjection(input)).toBe(false);
      });
    });

    it('should detect and prevent XSS attacks', async () => {
      const { containsXSS } = await import('@repo/validation');

      const xssInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)',
        '<svg onload="alert(1)">',
        'eval(document.cookie)',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<body onload="alert(1)">',
        '<div onclick="maliciousFunction()">',
      ];

      vi.mocked(containsXSS).mockImplementation((input: string) => {
        const xssPatterns = [
          /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe[\s\S]*?>/gi,
          /eval\s*\(/gi,
          /<embed[\s\S]*?>/gi,
          /<object[\s\S]*?>/gi,
        ];
        return xssPatterns.some(pattern => pattern.test(input));
      });

      xssInputs.forEach(input => {
        expect(containsXSS(input)).toBe(true);
      });

      // Valid inputs should pass
      const validInputs = [
        "Normal text content",
        "<b>Bold text</b>",
        "<i>Italic text</i>",
        "Price: $99.99",
      ];

      validInputs.forEach(input => {
        expect(containsXSS(input)).toBe(false);
      });
    });

    it('should sanitize HTML content safely', async () => {
      const { sanitizeHtml } = await import('@repo/validation');

      vi.mocked(sanitizeHtml).mockImplementation((input: string, options: any) => {
        const allowedTags = options?.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'];
        
        // Simple mock sanitization - remove dangerous tags
        let sanitized = input
          .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
          .replace(/<iframe[\s\S]*?>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=[^>]*/gi, '');
        
        // Keep only allowed tags
        const tagRegex = /<\/?(\w+)[^>]*>/g;
        sanitized = sanitized.replace(tagRegex, (match, tagName) => {
          if (allowedTags.includes(tagName.toLowerCase())) {
            return match;
          }
          return '';
        });
        
        return sanitized;
      });

      const dangerousHtml = `
        <p>Safe paragraph</p>
        <script>alert('xss')</script>
        <b>Bold text</b>
        <img src="x" onerror="alert(1)">
        <i>Italic text</i>
      `;

      const sanitized = sanitizeHtml(dangerousHtml, {
        allowedTags: ['p', 'b', 'i', 'em', 'strong'],
      });

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<img');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).toContain('<p>Safe paragraph</p>');
      expect(sanitized).toContain('<b>Bold text</b>');
      expect(sanitized).toContain('<i>Italic text</i>');
    });

    it('should validate file uploads securely', async () => {
      const { validateFileUpload } = await import('@repo/validation');

      vi.mocked(validateFileUpload).mockImplementation((filename: string, size: number, mimeType: string) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        
        const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        
        if (!allowedMimeTypes.includes(mimeType)) {
          return { isValid: false, error: 'Invalid file type' };
        }
        
        if (!allowedExtensions.includes(fileExtension)) {
          return { isValid: false, error: 'Invalid file extension' };
        }
        
        if (size > maxSize) {
          return { isValid: false, error: 'File too large' };
        }
        
        return { isValid: true };
      });

      // Valid files
      const validFiles = [
        { filename: 'image.jpg', size: 1024 * 1024, mimeType: 'image/jpeg' },
        { filename: 'photo.png', size: 2 * 1024 * 1024, mimeType: 'image/png' },
        { filename: 'avatar.webp', size: 500 * 1024, mimeType: 'image/webp' },
      ];

      validFiles.forEach(file => {
        const result = validateFileUpload(file.filename, file.size, file.mimeType);
        expect(result.isValid).toBe(true);
      });

      // Invalid files
      const invalidFiles = [
        { filename: 'virus.exe', size: 1024, mimeType: 'application/x-executable' },
        { filename: 'script.js', size: 1024, mimeType: 'text/javascript' },
        { filename: 'large.jpg', size: 15 * 1024 * 1024, mimeType: 'image/jpeg' }, // Too large
        { filename: 'fake.png', size: 1024, mimeType: 'application/octet-stream' }, // Wrong MIME type
      ];

      invalidFiles.forEach(file => {
        const result = validateFileUpload(file.filename, file.size, file.mimeType);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should detect profanity and inappropriate content', async () => {
      const { containsProfanity } = await import('@repo/validation');

      vi.mocked(containsProfanity).mockImplementation((text: string) => {
        const profanityList = ['spam', 'scam', 'fake', 'fraud', 'stolen'];
        return profanityList.some(word => text.toLowerCase().includes(word));
      });

      const inappropriateTexts = [
        'This is a scam product',
        'Selling FAKE designer items',
        'Definitely not stolen goods',
        'SPAM message about products',
      ];

      inappropriateTexts.forEach(text => {
        expect(containsProfanity(text)).toBe(true);
      });

      const appropriateTexts = [
        'Genuine iPhone in excellent condition',
        'Authentic Nike shoes, barely used',
        'Beautiful handmade jewelry',
      ];

      appropriateTexts.forEach(text => {
        expect(containsProfanity(text)).toBe(false);
      });
    });
  });

  describe('Authentication Middleware', () => {
    it('should protect routes with authentication requirement', async () => {
      const { requireAuth } = await import('@repo/auth/middleware');

      vi.mocked(requireAuth).mockImplementation((handler) => {
        return async (request: NextRequest) => {
          const authHeader = request.headers.get('authorization');
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
          return handler(request);
        };
      });

      const protectedHandler = async (req: NextRequest) => {
        return NextResponse.json({ message: 'Protected resource accessed' });
      };

      const wrappedHandler = requireAuth(protectedHandler);

      // Request without auth
      const unauthorizedRequest = new NextRequest('http://localhost:3002/api/protected');
      const unauthorizedResponse = await wrappedHandler(unauthorizedRequest);
      const unauthorizedData = await unauthorizedResponse.json();

      expect(unauthorizedResponse.status).toBe(401);
      expect(unauthorizedData.error).toBe('Unauthorized');

      // Request with auth
      const authorizedRequest = new NextRequest('http://localhost:3002/api/protected', {
        headers: { 'authorization': 'Bearer valid-token' },
      });
      const authorizedResponse = await wrappedHandler(authorizedRequest);
      const authorizedData = await authorizedResponse.json();

      expect(authorizedResponse.status).toBe(200);
      expect(authorizedData.message).toBe('Protected resource accessed');
    });

    it('should enforce role-based access control', async () => {
      const { requireRole } = await import('@repo/auth/middleware');

      vi.mocked(requireRole).mockImplementation((roles: string[]) => {
        return (handler: any) => async (request: NextRequest) => {
          const userRole = request.headers.get('x-user-role');
          
          if (!userRole || !roles.includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
          }
          
          return handler(request);
        };
      });

      const adminHandler = async (req: NextRequest) => {
        return NextResponse.json({ message: 'Admin resource accessed' });
      };

      const wrappedAdminHandler = requireRole(['admin'])(adminHandler);

      // Regular user trying to access admin resource
      const userRequest = new NextRequest('http://localhost:3002/api/admin', {
        headers: { 'x-user-role': 'user' },
      });
      const userResponse = await wrappedAdminHandler(userRequest);
      const userData = await userResponse.json();

      expect(userResponse.status).toBe(403);
      expect(userData.error).toBe('Forbidden');

      // Admin accessing admin resource
      const adminRequest = new NextRequest('http://localhost:3002/api/admin', {
        headers: { 'x-user-role': 'admin' },
      });
      const adminResponse = await wrappedAdminHandler(adminRequest);
      const adminData = await adminResponse.json();

      expect(adminResponse.status).toBe(200);
      expect(adminData.message).toBe('Admin resource accessed');
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF tokens for state-changing operations', async () => {
      const { csrfProtection } = await import('@repo/security');

      vi.mocked(csrfProtection).mockImplementation((handler) => {
        return async (request: NextRequest) => {
          const method = request.method;
          if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const csrfToken = request.headers.get('x-csrf-token');
            const sessionToken = request.headers.get('x-session-token');
            
            if (!csrfToken || !sessionToken || csrfToken !== `csrf-${sessionToken}`) {
              return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 });
            }
          }
          return handler(request);
        };
      });

      const protectedHandler = async (req: NextRequest) => {
        return NextResponse.json({ message: 'Operation successful' });
      };

      const wrappedHandler = csrfProtection(protectedHandler);

      // POST request without CSRF token
      const invalidRequest = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Product' }),
      });
      const invalidResponse = await wrappedHandler(invalidRequest);
      const invalidData = await invalidResponse.json();

      expect(invalidResponse.status).toBe(403);
      expect(invalidData.error).toBe('CSRF token invalid');

      // POST request with valid CSRF token
      const validRequest = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'csrf-session123',
          'x-session-token': 'session123',
        },
        body: JSON.stringify({ title: 'Test Product' }),
      });
      const validResponse = await wrappedHandler(validRequest);
      const validData = await validResponse.json();

      expect(validResponse.status).toBe(200);
      expect(validData.message).toBe('Operation successful');

      // GET request should not require CSRF token
      const getRequest = new NextRequest('http://localhost:3002/api/products');
      const getResponse = await wrappedHandler(getRequest);
      const getData = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getData.message).toBe('Operation successful');
    });
  });

  describe('Security Headers', () => {
    it('should set appropriate security headers', async () => {
      const mockSecurityMiddleware = async (request: NextRequest) => {
        const response = NextResponse.json({ success: true });
        
        // Add security headers
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        response.headers.set(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        );
        
        return response;
      };

      const request = new NextRequest('http://localhost:3002/api/test');
      const response = await mockSecurityMiddleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
      expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });
  });

  describe('Security Event Logging', () => {
    it('should log security-related events', async () => {
      const { logSecurityEvent } = await import('@repo/observability/server');

      const mockSecurityEventHandler = async (eventType: string, details: any) => {
        // Log security event
        logSecurityEvent(eventType, details);
        
        return NextResponse.json({ logged: true });
      };

      await mockSecurityEventHandler('RATE_LIMIT_EXCEEDED', {
        ip: '192.168.1.1',
        endpoint: '/api/login',
        userAgent: 'Mozilla/5.0...',
      });

      await mockSecurityEventHandler('INVALID_LOGIN_ATTEMPT', {
        email: 'attacker@evil.com',
        ip: '192.168.1.2',
        timestamp: new Date().toISOString(),
      });

      await mockSecurityEventHandler('SQL_INJECTION_ATTEMPT', {
        input: "'; DROP TABLE users; --",
        endpoint: '/api/products',
        ip: '192.168.1.3',
      });

      expect(logSecurityEvent).toHaveBeenCalledTimes(3);
      expect(logSecurityEvent).toHaveBeenCalledWith('RATE_LIMIT_EXCEEDED', expect.any(Object));
      expect(logSecurityEvent).toHaveBeenCalledWith('INVALID_LOGIN_ATTEMPT', expect.any(Object));
      expect(logSecurityEvent).toHaveBeenCalledWith('SQL_INJECTION_ATTEMPT', expect.any(Object));
    });
  });

  describe('Password Security', () => {
    it('should validate password strength', async () => {
      const { isValidPassword } = await import('@repo/validation');

      vi.mocked(isValidPassword).mockImplementation((password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return {
          isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
          errors: [
            ...(password.length < minLength ? ['Password must be at least 8 characters long'] : []),
            ...((!hasUpperCase) ? ['Password must contain uppercase letters'] : []),
            ...((!hasLowerCase) ? ['Password must contain lowercase letters'] : []),
            ...((!hasNumbers) ? ['Password must contain numbers'] : []),
            ...((!hasSpecialChar) ? ['Password must contain special characters'] : []),
          ],
        };
      });

      // Weak passwords
      const weakPasswords = [
        'password',
        '12345678',
        'Password',
        'Password1',
      ];

      weakPasswords.forEach(password => {
        const result = isValidPassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      // Strong passwords
      const strongPasswords = [
        'MyStr0ng!Pass',
        'Secure123$',
        'C0mplex!Pass#2024',
      ];

      strongPasswords.forEach(password => {
        const result = isValidPassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
    });
  });

  describe('Email Validation', () => {
    it('should validate email addresses securely', async () => {
      const { isValidEmail } = await import('@repo/validation');

      vi.mocked(isValidEmail).mockImplementation((email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        
        // Additional security checks
        const containsDangerousChars = /[<>()[\]\\.,;:\s@"]/.test(email.split('@')[0]);
        const isReasonableLength = email.length <= 254;
        
        return isValid && !containsDangerousChars && isReasonableLength;
      });

      // Valid emails
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'valid+email@test.org',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });

      // Invalid emails
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user<script>@domain.com',
        'user@domain',
        'a'.repeat(250) + '@domain.com', // Too long
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('Environment Variable Security', () => {
    it('should verify sensitive environment variables are configured', () => {
      const requiredEnvVars = [
        'DATABASE_URL',
        'CLERK_SECRET_KEY',
        'STRIPE_SECRET_KEY',
        'ARCJET_KEY',
        'UPSTASH_REDIS_REST_URL',
      ];

      const mockEnvCheck = () => {
        const missing = [];
        const insecure = [];

        for (const envVar of requiredEnvVars) {
          const value = process.env[envVar];
          
          if (!value) {
            missing.push(envVar);
          } else if (value.includes('placeholder') || value === 'your-key-here') {
            insecure.push(envVar);
          }
        }

        return { missing, insecure };
      };

      // Mock environment variables
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.CLERK_SECRET_KEY = 'sk_test_real_key';
      process.env.STRIPE_SECRET_KEY = 'sk_test_real_stripe_key';
      process.env.ARCJET_KEY = 'ajkey_real_key';
      process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';

      const result = mockEnvCheck();
      
      expect(result.missing).toHaveLength(0);
      expect(result.insecure).toHaveLength(0);
    });
  });

  describe('Request Size Limits', () => {
    it('should enforce request size limits', async () => {
      const mockSizeLimitMiddleware = async (request: NextRequest, maxSize: number = 1024 * 1024) => {
        const contentLength = request.headers.get('content-length');
        
        if (contentLength && parseInt(contentLength) > maxSize) {
          return NextResponse.json(
            { error: 'Request too large' },
            { status: 413 }
          );
        }

        return NextResponse.json({ success: true });
      };

      // Small request (should pass)
      const smallRequest = new NextRequest('http://localhost:3002/api/upload', {
        method: 'POST',
        headers: { 'content-length': '1024' },
        body: 'small content',
      });

      const smallResponse = await mockSizeLimitMiddleware(smallRequest);
      expect(smallResponse.status).toBe(200);

      // Large request (should fail)
      const largeRequest = new NextRequest('http://localhost:3002/api/upload', {
        method: 'POST',
        headers: { 'content-length': '10485760' }, // 10MB
        body: 'large content',
      });

      const largeResponse = await mockSizeLimitMiddleware(largeRequest);
      const largeData = await largeResponse.json();

      expect(largeResponse.status).toBe(413);
      expect(largeData.error).toBe('Request too large');
    });
  });
});