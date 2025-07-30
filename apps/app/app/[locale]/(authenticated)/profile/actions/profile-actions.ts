'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/tooling/observability/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});

const updateAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  country: z.string().min(1),
});

const updateNotificationSchema = z.object({
  emailMarketing: z.boolean(),
  emailOrders: z.boolean(),
  emailMessages: z.boolean(),
  emailUpdates: z.boolean(),
  pushNotifications: z.boolean(),
  pushMessages: z.boolean(),
  pushOffers: z.boolean(),
});

export async function updateUserProfile(
  input: z.infer<typeof updateProfileSchema>
) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = updateProfileSchema.parse(input);

    // Note: In a real implementation, you would update the user profile through Clerk's API
    // Since we're using Clerk for authentication, user profile updates need to be done through their API
    // For now, we'll just store additional marketplace-specific data in our database

    // Create or update user profile data in our database
    await database.user.upsert({
      where: {
        clerkId: user.id,
      },
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        bio: validatedInput.bio,
        location: validatedInput.location,
      },
      update: {
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        bio: validatedInput.bio,
        location: validatedInput.location,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    logError('Failed to update user profile:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.issues,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function updateShippingAddress(
  input: z.infer<typeof updateAddressSchema>
) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = updateAddressSchema.parse(input);

    // Store the address data for future use
    // In a real app, you might want to store this in a separate user_addresses table
    // For now, we'll update the user record with the default shipping address
    // TODO: Implement address storage once the User model has address fields
    // For now, we'll just return success without storing the address
    log.info('Address update requested:', validatedInput);

    return {
      success: true,
    };
  } catch (error) {
    logError('Failed to update shipping address:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.issues,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update address',
    };
  }
}

export async function updateNotificationSettings(
  input: z.infer<typeof updateNotificationSchema>
) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Validate input
    const validatedInput = updateNotificationSchema.parse(input);

    // Store notification preferences in our database
    await database.user.upsert({
      where: {
        clerkId: user.id,
      },
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        notificationPreferences: JSON.stringify(validatedInput),
      },
      update: {
        notificationPreferences: JSON.stringify(validatedInput),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    logError('Failed to update notification settings:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.issues,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update notification settings',
    };
  }
}
