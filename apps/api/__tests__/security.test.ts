/**
 * Security Tests for API Routes
 *
 * This test suite verifies that all critical security measures are in place
 * and functioning correctly.
 */

import { describe, expect, it } from 'vitest';
import {
  containsSQLInjection,
  containsXSS,
  validateAndSanitizeInput,
  validateFileUpload,
} from '../lib/security-utils';

describe('Security Utils', () => {
  describe('Input Validation and Sanitization', () => {
    it('should reject dangerous SQL injection patterns', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        'UNION SELECT * FROM passwords',
        '; DELETE FROM products WHERE 1=1',
      ];

      for (const input of maliciousInputs) {
        expect(containsSQLInjection(input)).toBe(true);
      }
    });

    it('should reject XSS patterns', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(1)',
        '<svg onload="alert(1)">',
        'eval(document.cookie)',
      ];

      for (const input of xssInputs) {
        expect(containsXSS(input)).toBe(true);
      }
    });

    it('should sanitize valid input', () => {
      const testData = {
        title: 'Valid Product Title',
        description: 'A normal product description',
        price: 29.99,
      };

      const allowedFields = ['title', 'description', 'price'];
      const result = validateAndSanitizeInput(testData, allowedFields);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toBeDefined();
      expect(result.sanitizedData?.title).toBe('Valid Product Title');
    });

    it('should reject unauthorized fields', () => {
      const testData = {
        title: 'Valid Product Title',
        adminField: 'should not be allowed',
      };

      const allowedFields = ['title'];
      const result = validateAndSanitizeInput(testData, allowedFields);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('adminField');
    });
  });

  describe('File Upload Validation', () => {
    it('should accept valid image files', () => {
      const validFiles = [
        { filename: 'image.jpg', size: 1024 * 1024, mimeType: 'image/jpeg' },
        { filename: 'photo.png', size: 2 * 1024 * 1024, mimeType: 'image/png' },
        { filename: 'avatar.webp', size: 500 * 1024, mimeType: 'image/webp' },
      ];

      for (const file of validFiles) {
        const result = validateFileUpload(
          file.filename,
          file.size,
          file.mimeType
        );
        expect(result.isValid).toBe(true);
      }
    });

    it('should reject dangerous file types', () => {
      const dangerousFiles = [
        {
          filename: 'virus.exe',
          size: 1024,
          mimeType: 'application/x-executable',
        },
        { filename: 'script.php', size: 1024, mimeType: 'text/php' },
        { filename: 'payload.js', size: 1024, mimeType: 'text/javascript' },
        { filename: 'malware.bat', size: 1024, mimeType: 'application/bat' },
      ];

      for (const file of dangerousFiles) {
        const result = validateFileUpload(
          file.filename,
          file.size,
          file.mimeType
        );
        expect(result.isValid).toBe(false);
      }
    });

    it('should reject oversized files', () => {
      const oversizedFile = {
        filename: 'large.jpg',
        size: 15 * 1024 * 1024, // 15MB (over 10MB limit)
        mimeType: 'image/jpeg',
      };

      const result = validateFileUpload(
        oversizedFile.filename,
        oversizedFile.size,
        oversizedFile.mimeType
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too large');
    });
  });
});

const ARCJET_KEY_PATTERN = /^ajkey_/;

describe('Security Configuration Tests', () => {
  it('should verify environment variables are properly configured', () => {
    // Test that critical environment variables are set
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.CLERK_SECRET_KEY).toBeDefined();
    expect(process.env.STRIPE_SECRET_KEY).toBeDefined();

    // Test that webhook secret is not a placeholder
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      expect(process.env.STRIPE_WEBHOOK_SECRET).not.toContain('placeholder');
    }
  });

  it('should verify rate limiting is configured', () => {
    // Test that Arcjet key is available
    expect(process.env.ARCJET_KEY).toBeDefined();
    expect(process.env.ARCJET_KEY).toMatch(ARCJET_KEY_PATTERN);
  });
});
