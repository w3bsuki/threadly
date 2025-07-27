/**
 * Custom business logic validators
 */

import { z } from 'zod';
import validator from 'validator';

/**
 * Check if email is from a disposable email provider
 */
export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'maildrop.cc',
    'mintemail.com',
    'temp-mail.org',
    'yopmail.com',
    'trashmail.com',
    'getnada.com',
    'temp-mail.io',
    'mohmal.com',
    'dispostable.com',
    'mailnesia.com',
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? disposableDomains.includes(domain) : false;
};

/**
 * Validate credit card number using Luhn algorithm
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  return validator.isCreditCard(cleaned);
};

/**
 * Validate IBAN (International Bank Account Number)
 */
export const isValidIBAN = (iban: string): boolean => {
  return validator.isIBAN(iban);
};

/**
 * Check if price is within marketplace limits
 */
export const isPriceInRange = (price: number, min = 0.01, max = 999999.99): boolean => {
  return price >= min && price <= max;
};

/**
 * Validate product title for marketplace standards
 */
export const isValidProductTitle = (title: string): boolean => {
  // Check length
  if (title.length < 3 || title.length > 100) {
    return false;
  }
  
  // Check for excessive capitalization (SHOUTING)
  const upperCaseRatio = (title.match(/[A-Z]/g) || []).length / title.length;
  if (upperCaseRatio > 0.5) {
    return false;
  }
  
  // Check for excessive special characters
  const specialCharRatio = (title.match(/[!@#$%^&*()]/g) || []).length / title.length;
  if (specialCharRatio > 0.1) {
    return false;
  }
  
  // Check for repetitive characters (e.g., "!!!!" or "aaaa")
  if (/(.)\1{3,}/.test(title)) {
    return false;
  }
  
  return true;
};

/**
 * Check if image URL is from allowed CDN/domain
 */
export const isAllowedImageUrl = (url: string, allowedDomains: string[] = []): boolean => {
  const defaultAllowed = [
    'uploadthing.com',
    'utfs.io',
    'cloudinary.com',
    'imgix.net',
    'images.unsplash.com',
    'cdn.threadly.com', // Your own CDN
  ];
  
  const allAllowed = [...defaultAllowed, ...allowedDomains];
  
  try {
    const parsed = new URL(url);
    return allAllowed.some(domain => parsed.hostname.includes(domain));
  } catch {
    return false;
  }
};

/**
 * Validate shipping address completeness
 */
export const isCompleteAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}): boolean => {
  return !!(
    address.street &&
    address.city &&
    address.postalCode &&
    address.country
  );
};

/**
 * Check if user is old enough (18+)
 */
export const isAdult = (dateOfBirth: Date): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
};

/**
 * Validate business tax ID format (US EIN or SSN)
 */
export const isValidTaxId = (taxId: string): boolean => {
  // Remove any formatting
  const cleaned = taxId.replace(/[^\d]/g, '');
  
  // EIN format: XX-XXXXXXX (9 digits)
  if (cleaned.length === 9) {
    return /^\d{9}$/.test(cleaned);
  }
  
  // SSN format: XXX-XX-XXXX (9 digits)
  if (cleaned.length === 9) {
    return /^\d{9}$/.test(cleaned);
  }
  
  return false;
};

/**
 * Check if username is available (mock - would check database in reality)
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  // Reserved usernames
  const reserved = [
    'admin',
    'root',
    'threadly',
    'support',
    'help',
    'api',
    'www',
    'mail',
    'ftp',
    'blog',
    'shop',
    'store',
  ];
  
  return !reserved.includes(username.toLowerCase());
};

/**
 * Validate product SKU format
 */
export const isValidSKU = (sku: string): boolean => {
  // SKU should be alphanumeric with optional hyphens
  return /^[A-Z0-9]+(-[A-Z0-9]+)*$/i.test(sku) && sku.length <= 50;
};

/**
 * Check if file extension is allowed
 */
export const isAllowedFileType = (
  filename: string, 
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
): boolean => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
};

/**
 * Validate coordinate bounds
 */
export const areValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Check password strength with detailed feedback
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Password should be at least 8 characters');
  
  if (password.length >= 12) score++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) score++;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Add special characters');
  
  // Common patterns to avoid
  if (/(.)\1{2,}/.test(password)) {
    score--;
    feedback.push('Avoid repeating characters');
  }
  
  if (/^[0-9]+$/.test(password)) {
    score--;
    feedback.push('Don\'t use only numbers');
  }
  
  // Common passwords check (simplified)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score = 0;
    feedback.push('This password is too common');
  }
  
  return {
    score: Math.max(0, Math.min(4, score)),
    feedback,
    isStrong: score >= 3,
  };
};

/**
 * Validate order quantity limits
 */
export const isValidOrderQuantity = (
  quantity: number, 
  availableStock: number,
  maxPerOrder: number = 10
): boolean => {
  return quantity > 0 && quantity <= availableStock && quantity <= maxPerOrder;
};

/**
 * Check if review text is valid
 */
export const isValidReview = (text: string, rating: number): boolean => {
  // Minimum length for low ratings (to ensure constructive feedback)
  if (rating <= 2 && text.length < 20) {
    return false;
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{5,}/, // Repeated characters
    /https?:\/\//i, // URLs in reviews
    /\b(buy now|click here|visit)\b/i, // Promotional language
  ];
  
  return !spamPatterns.some(pattern => pattern.test(text));
};

/**
 * Validate offer amount for negotiation
 */
export const isValidOffer = (
  offerAmount: number,
  originalPrice: number,
  minOfferPercentage: number = 50
): boolean => {
  const minOffer = originalPrice * (minOfferPercentage / 100);
  return offerAmount >= minOffer && offerAmount < originalPrice;
};

/**
 * Type guards for runtime type checking
 */
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value);
};