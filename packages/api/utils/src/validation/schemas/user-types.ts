import { z } from 'zod';

export const UserRoleSchema = z.enum(['USER', 'SELLER', 'ADMIN', 'MODERATOR']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
  'BANNED',
]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const SellerStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
]);
export type SellerStatus = z.infer<typeof SellerStatusSchema>;

export const NotificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  marketing: z.boolean().default(false),
  orderUpdates: z.boolean().default(true),
  messages: z.boolean().default(true),
  priceDrops: z.boolean().default(true),
  newListings: z.boolean().default(true),
});

export type NotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>;

export const PrivacySettingsSchema = z.object({
  profileVisible: z.boolean().default(true),
  showFullName: z.boolean().default(false),
  showLocation: z.boolean().default(true),
  showOnlineStatus: z.boolean().default(true),
  allowMessages: z.boolean().default(true),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  website: z.string().url().nullable().optional(),
  socialLinks: z
    .object({
      instagram: z.string().nullable().optional(),
      twitter: z.string().nullable().optional(),
      facebook: z.string().nullable().optional(),
    })
    .optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  joinedAt: z.date(),
  lastSeenAt: z.date().nullable().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UserSchema = z.object({
  id: z.string(),
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  role: UserRoleSchema.default('USER'),
  status: UserStatusSchema.default('ACTIVE'),
  emailVerified: z.boolean().default(false),
  phoneNumber: z.string().nullable().optional(),
  phoneVerified: z.boolean().default(false),
  profile: UserProfileSchema.optional(),
  notificationPreferences: NotificationPreferencesSchema.default(() => ({
    email: true,
    push: true,
    sms: false,
    marketing: false,
    orderUpdates: true,
    messages: true,
    priceDrops: true,
    newListings: true,
  })),
  privacySettings: PrivacySettingsSchema.default(() => ({
    profileVisible: true,
    showFullName: false,
    showLocation: true,
    showOnlineStatus: true,
    allowMessages: true,
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const SellerProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: SellerStatusSchema,
  stripeAccountId: z.string().nullable().optional(),
  stripeAccountStatus: z.string().nullable().optional(),
  businessName: z.string().nullable().optional(),
  businessDescription: z.string().max(1000).nullable().optional(),
  returnPolicy: z.string().max(2000).nullable().optional(),
  shippingPolicy: z.string().max(2000).nullable().optional(),
  responseTime: z.number().int().positive().nullable().optional(), // hours
  rating: z.number().min(0).max(5).nullable().optional(),
  totalSales: z.number().int().min(0).default(0),
  totalRevenue: z.number().min(0).default(0),
  verifiedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SellerProfile = z.infer<typeof SellerProfileSchema>;

export const PublicUserSchema = UserSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  imageUrl: true,
  createdAt: true,
}).extend({
  profile: UserProfileSchema.pick({
    bio: true,
    location: true,
    avatarUrl: true,
  }).optional(),
  sellerProfile: SellerProfileSchema.pick({
    businessName: true,
    rating: true,
    totalSales: true,
    verifiedAt: true,
  }).optional(),
});

export type PublicUser = z.infer<typeof PublicUserSchema>;
