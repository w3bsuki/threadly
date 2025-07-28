import DOMPurify from 'isomorphic-dompurify';

export class Sanitizer {
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(-{2}|\/\*|\*\/|;|'|"|`|\\x00|\\n|\\r|\\x1a)/g,
  ];

  private static readonly XSS_PATTERNS = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /<object[^>]*>[\s\S]*?<\/object>/gi,
    /<embed[^>]*>/gi,
  ];

  private static readonly ALLOWED_HTML_TAGS = [
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ];

  private static readonly ALLOWED_ATTRIBUTES = {
    a: ['href', 'title', 'target'],
    '*': ['class'],
  };

  static sanitizeString(
    input: string,
    options?: {
      maxLength?: number;
      allowHtml?: boolean;
      trim?: boolean;
    }
  ): string {
    const {
      maxLength = 10_000,
      allowHtml = false,
      trim = true,
    } = options || {};

    let sanitized = input;

    if (trim) {
      sanitized = sanitized.trim();
    }

    if (allowHtml) {
      sanitized = Sanitizer.sanitizeHtml(sanitized);
    } else {
      sanitized = Sanitizer.stripHtml(sanitized);
    }

    sanitized = Sanitizer.preventSqlInjection(sanitized);

    if (maxLength > 0) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: Sanitizer.ALLOWED_HTML_TAGS,
      ALLOWED_ATTR: Object.entries(Sanitizer.ALLOWED_ATTRIBUTES).flatMap(
        ([tag, attrs]) =>
          attrs.map((attr) => `${tag === '*' ? '' : tag + ':'}${attr}`)
      ),
      ALLOW_DATA_ATTR: false,
      KEEP_CONTENT: true,
    });
  }

  static stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  static preventSqlInjection(input: string): string {
    let sanitized = input;

    for (const pattern of Sanitizer.SQL_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }

  static preventXss(input: string): string {
    let sanitized = input;

    for (const pattern of Sanitizer.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }

  static sanitizeEmail(email: string): string {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      throw new Error('Invalid email format');
    }

    return trimmed;
  }

  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }

      return parsed.toString();
    } catch {
      throw new Error('Invalid URL format');
    }
  }

  static sanitizeNumber(
    input: string | number,
    options?: {
      min?: number;
      max?: number;
      allowDecimal?: boolean;
    }
  ): number {
    const { min, max, allowDecimal = true } = options || {};

    let num = typeof input === 'string' ? Number.parseFloat(input) : input;

    if (isNaN(num)) {
      throw new Error('Invalid number');
    }

    if (!allowDecimal) {
      num = Math.floor(num);
    }

    if (min !== undefined && num < min) {
      num = min;
    }

    if (max !== undefined && num > max) {
      num = max;
    }

    return num;
  }

  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    rules: Partial<Record<keyof T, (value: any) => any>>
  ): T {
    const sanitized = { ...obj };

    for (const [key, sanitizer] of Object.entries(rules)) {
      if (key in sanitized && sanitizer) {
        try {
          sanitized[key as keyof T] = (sanitizer as Function)(
            sanitized[key as keyof T]
          );
        } catch (error) {
          delete sanitized[key as keyof T];
        }
      }
    }

    return sanitized;
  }

  static sanitizeArray<T>(array: T[], sanitizer: (item: T) => T): T[] {
    return array
      .map((item) => {
        try {
          return sanitizer(item);
        } catch {
          return null;
        }
      })
      .filter((item): item is T => item !== null);
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }

  static sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[<>'"]/g, '')
      .substring(0, 100);
  }
}
