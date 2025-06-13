/**
 * Sanitization utilities for user input
 */

import DOMPurify from 'isomorphic-dompurify';

// Type definitions for DOMPurify.Config
interface DOMPurifyConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
  [key: string]: any;
}
import BadWordsFilter from 'bad-words';

// Initialize profanity filter
const profanityFilter = new BadWordsFilter();

// Add custom bad words if needed
profanityFilter.addWords('scam', 'fake', 'counterfeit');

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string, options?: DOMPurifyConfig): string => {
  const defaultOptions: DOMPurifyConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    ...options,
  };
  
  return DOMPurify.sanitize(html, defaultOptions);
};

/**
 * Strict HTML sanitization - removes all HTML
 */
export const stripHtml = (html: string): string => {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Sanitize user-generated text content
 */
export const sanitizeText = (text: string): string => {
  // Remove any HTML tags
  let sanitized = stripHtml(text);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Remove zero-width characters
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  return sanitized;
};

/**
 * Filter profanity from text
 */
export const filterProfanity = (text: string, replacement = '***'): string => {
  try {
    return profanityFilter.clean(text);
  } catch (error) {
    // If profanity filter fails, return original text
    return text;
  }
};

/**
 * Check if text contains profanity
 */
export const containsProfanity = (text: string): boolean => {
  try {
    return profanityFilter.isProfane(text);
  } catch (error) {
    return false;
  }
};

/**
 * Sanitize filename to prevent directory traversal
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove any path separators
  let sanitized = filename.replace(/[\/\\]/g, '');
  
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Remove multiple dots to prevent extension spoofing
  sanitized = sanitized.replace(/\.{2,}/g, '.');
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 255 - extension.length - 1) + '.' + extension;
  }
  
  return sanitized;
};

/**
 * Escape SQL special characters (basic protection - use parameterized queries for real protection)
 */
export const escapeSql = (str: string): string => {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char;
      default:
        return char;
    }
  });
};

/**
 * Sanitize JSON string to prevent injection
 */
export const sanitizeJson = (jsonString: string): string => {
  try {
    // Parse and stringify to ensure valid JSON
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error('Invalid JSON input');
  }
};

/**
 * Sanitize URL to prevent open redirect vulnerabilities
 */
export const sanitizeUrl = (url: string, allowedHosts?: string[]): string => {
  try {
    const parsed = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Check against allowed hosts if provided
    if (allowedHosts && !allowedHosts.includes(parsed.host)) {
      throw new Error('Host not allowed');
    }
    
    return parsed.toString();
  } catch (error) {
    throw new Error('Invalid URL');
  }
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string): string => {
  // Convert to lowercase and trim
  return email.toLowerCase().trim();
};

/**
 * Sanitize phone number - remove all non-numeric characters except +
 */
export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength - suffix.length);
  // Try to break at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + suffix;
  }
  
  return truncated + suffix;
};

/**
 * Mask sensitive data (e.g., credit card, SSN)
 */
export const maskSensitiveData = (
  data: string, 
  visibleStart = 0, 
  visibleEnd = 4, 
  maskChar = '*'
): string => {
  if (data.length <= visibleStart + visibleEnd) {
    return data;
  }
  
  const start = data.substring(0, visibleStart);
  const end = data.substring(data.length - visibleEnd);
  const middle = maskChar.repeat(data.length - visibleStart - visibleEnd);
  
  return start + middle + end;
};

/**
 * Remove EXIF data from base64 image
 */
export const sanitizeBase64Image = (base64: string): string => {
  // This is a placeholder - in production, use a library like piexifjs
  // to actually remove EXIF data which might contain GPS coordinates
  return base64;
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeForDisplay = (input: string): string => {
  let sanitized = sanitizeText(input);
  sanitized = filterProfanity(sanitized);
  return sanitized;
};

/**
 * Sanitize markdown content
 */
export const sanitizeMarkdown = (markdown: string): string => {
  // Allow basic markdown but strip potentially dangerous content
  let sanitized = markdown;
  
  // Remove HTML tags
  sanitized = stripHtml(sanitized);
  
  // Remove javascript: links
  sanitized = sanitized.replace(/\[([^\]]+)\]\(javascript:[^)]+\)/gi, '[$1]()');
  
  // Remove data: URLs except images
  sanitized = sanitized.replace(/\[([^\]]+)\]\(data:(?!image)[^)]+\)/gi, '[$1]()');
  
  return sanitized;
};

/**
 * Create a content security policy nonce
 */
export const generateCSPNonce = (): string => {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
};