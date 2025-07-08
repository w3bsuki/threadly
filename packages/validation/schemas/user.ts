/**
 * User validation schemas
 */

import { z } from 'zod';
import { 
  emailSchema, 
  phoneSchema, 
  usernameSchema, 
  passwordSchema,
  safeTextSchema,
  addressSchema,
  urlSchema,
  imageFileSchema,
  uuidSchema,
} from './common';

// User roles
export const userRoleSchema = z.enum(['USER', 'SELLER', 'ADMIN'], {
  errorMap: () => ({ message: 'Invalid user role' }),
});

// User status
export const userStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED'], {
  errorMap: () => ({ message: 'Invalid user status' }),
});

// Profile visibility
export const profileVisibilitySchema = z.enum(['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY'], {
  errorMap: () => ({ message: 'Invalid profile visibility' }),
});

// User preferences schema
export const userPreferencesSchema = z.object({
  newsletter: z.boolean().default(false),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(false),
    showLocation: z.boolean().default(false),
  }),
  language: z.enum(['en', 'es', 'fr', 'de', 'pt', 'zh', 'bg', 'uk']).default('en'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'BGN', 'UAH']).default('USD'),
});

// Create user profile schema
export const createUserProfileSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  
  firstName: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  lastName: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  
  bio: z.string().trim().min(1).max(500).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  website: urlSchema.optional(),
  
  phone: phoneSchema.optional(),
  
  dateOfBirth: z.coerce.date()
    .refine((date) => {
      const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 18;
    }, {
      message: 'You must be at least 18 years old',
    })
    .optional(),
  
  address: addressSchema.optional(),
  
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Update user profile schema
export const updateUserProfileSchema = z.object({
  username: usernameSchema.optional(),
  
  firstName: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  lastName: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  
  bio: z.string().trim().min(1).max(500).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  website: urlSchema.optional(),
  
  phone: phoneSchema.optional(),
  
  dateOfBirth: z.coerce.date()
    .refine((date) => {
      const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age >= 18;
    }, {
      message: 'You must be at least 18 years old',
    })
    .optional(),
  
  address: addressSchema.optional(),
  
  profileImage: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  
  visibility: profileVisibilitySchema.optional(),
  preferences: userPreferencesSchema.optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Email verification schema
export const emailVerificationSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'Verification code must be 6 characters'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// User search schema
export const userSearchSchema = z.object({
  query: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  hasProducts: z.boolean().optional(),
});

// Follow/unfollow schema
export const followUserSchema = z.object({
  userId: uuidSchema,
});

// Block/unblock schema
export const blockUserSchema = z.object({
  userId: uuidSchema,
  reason: z.string().trim().min(1).max(200).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
});

// Report user schema
export const reportUserSchema = z.object({
  userId: uuidSchema,
  reason: z.enum([
    'SPAM',
    'HARASSMENT',
    'FAKE_PROFILE',
    'INAPPROPRIATE_CONTENT',
    'SCAM',
    'OTHER',
  ]),
  description: z.string().trim().min(1).max(500).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
});

// User settings schema
export const userSettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  sessionTimeout: z.number().min(5).max(1440), // minutes
  loginNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

// Bank account schema (for sellers)
export const bankAccountSchema = z.object({
  accountHolderName: z.string().trim().min(1).max(100).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
  accountNumber: z.string()
    .regex(/^\d{8,17}$/, 'Invalid account number')
    .transform((val) => val.slice(-4).padStart(val.length, '*')), // Mask all but last 4 digits
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  accountType: z.enum(['CHECKING', 'SAVINGS']),
});

// Seller verification schema
export const sellerVerificationSchema = z.object({
  businessName: z.string().trim().min(1).max(100).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
  taxId: z.string()
    .regex(/^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/, 'Invalid tax ID format')
    .optional(),
  bankAccount: bankAccountSchema,
  acceptSellerTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the seller terms and conditions',
  }),
});

// Type exports
export type CreateUserProfile = z.infer<typeof createUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type SellerVerification = z.infer<typeof sellerVerificationSchema>;