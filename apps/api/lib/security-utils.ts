import { logError } from '@repo/tooling/observability/server';
import { sanitizeForDisplay } from '@repo/api/utils/validation/sanitize';

// Security validation utilities for API endpoints

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: Record<string, unknown>;
}

// Rate limiting tracking for enhanced security
export interface SecurityMetrics {
  suspiciousRequests: number;
  blockedRequests: number;
  authFailures: number;
  lastIncident: Date | null;
}

// Enhanced input validation with security checks
export const validateAndSanitizeInput = (
  data: Record<string, unknown>,
  allowedFields: string[]
): SecurityValidationResult => {
  try {
    const sanitizedData: Record<string, unknown> = {};

    // Check for potential injection attempts
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /exec\(/i,
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /update\s+.*set/i,
    ];

    for (const [key, value] of Object.entries(data)) {
      // Only allow whitelisted fields
      if (!allowedFields.includes(key)) {
        logError('Unauthorized field in request', { field: key, value });
        return {
          isValid: false,
          error: `Field '${key}' is not allowed`,
        };
      }

      // Check for dangerous patterns in string values
      if (typeof value === 'string') {
        const hasDangerousPattern = dangerousPatterns.some((pattern) =>
          pattern.test(value)
        );

        if (hasDangerousPattern) {
          logError('Dangerous pattern detected in input', {
            field: key,
            value,
          });
          return {
            isValid: false,
            error: 'Invalid input detected',
          };
        }

        // Sanitize the value
        sanitizedData[key] = sanitizeForDisplay(value);
      } else {
        sanitizedData[key] = value;
      }
    }

    return {
      isValid: true,
      sanitizedData,
    };
  } catch (error) {
    logError('Error in input validation', error);
    return {
      isValid: false,
      error: 'Validation failed',
    };
  }
};

// Check for SQL injection patterns
export const containsSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /union\s+select/i,
    /'\s*or\s*'1'\s*=\s*'1/i,
    /'\s*or\s*1\s*=\s*1/i,
    /'\s*;\s*drop\s+table/i,
    /'\s*;\s*delete\s+from/i,
    /'\s*;\s*insert\s+into/i,
    /'\s*;\s*update\s+.*set/i,
    /\bxp_cmdshell\b/i,
    /\bsp_executesql\b/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
};

// Check for XSS patterns
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<img[^>]*onerror[^>]*>/i,
    /<svg[^>]*onload[^>]*>/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
};

// Validate file upload security
export const validateFileUpload = (
  filename: string,
  size: number,
  mimeType: string
): SecurityValidationResult => {
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  // Check file size
  if (size > maxFileSize) {
    return {
      isValid: false,
      error: 'File too large',
    };
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file type',
    };
  }

  // Check file extension
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'Invalid file extension',
    };
  }

  // Check for dangerous filenames
  const dangerousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.html$/i,
    /\.htm$/i,
    /\.js$/i,
  ];

  if (dangerousPatterns.some((pattern) => pattern.test(filename))) {
    return {
      isValid: false,
      error: 'Dangerous file type',
    };
  }

  return { isValid: true };
};

// Enhanced request validation for API endpoints
export const validateAPIRequest = (
  request: Request,
  requiredHeaders: string[] = []
): SecurityValidationResult => {
  try {
    const userAgent = request.headers.get('user-agent');
    const contentType = request.headers.get('content-type');

    // Check for missing User-Agent (potential bot)
    if (!userAgent) {
      return {
        isValid: false,
        error: 'Missing User-Agent header',
      };
    }

    // Check for required headers
    for (const header of requiredHeaders) {
      if (!request.headers.get(header)) {
        return {
          isValid: false,
          error: `Missing required header: ${header}`,
        };
      }
    }

    // Validate Content-Type for POST/PUT requests
    const hasBody = ['POST', 'PUT', 'PATCH'].includes(
      request.method?.toUpperCase() || ''
    );

    if (hasBody && contentType && !contentType.includes('application/json')) {
      return {
        isValid: false,
        error: 'Invalid Content-Type',
      };
    }

    return { isValid: true };
  } catch (error) {
    logError('Error in API request validation', error);
    return {
      isValid: false,
      error: 'Request validation failed',
    };
  }
};

// Create a security audit log entry
export const logSecurityEvent = (
  event: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) => {
  logError(`Security Event: ${event}`, {
    ...details,
    severity,
    timestamp: new Date().toISOString(),
    source: 'api-security',
  });
};

// Helper to generate secure response headers
export const getSecureResponseHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };
};
