'use server';

import { database } from '@repo/database';
import { log, logError } from '@repo/tooling/observability/server';
import {
  bulkOperationSchema,
  sanitizeForDisplay,
  suspendUserSchema,
  updateUserRoleSchema,
} from '@repo/api/utils/validation';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';

export async function updateUserRole(
  userId: string,
  role: 'USER' | 'ADMIN' | 'MODERATOR'
) {
  await requireAdmin();

  // Validate input
  const validationResult = updateUserRoleSchema.safeParse({ userId, role });
  if (!validationResult.success) {
    throw new Error(
      `Invalid input: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
    );
  }

  const { userId: validatedUserId, role: validatedRole } =
    validationResult.data;

  await database.user.update({
    where: { id: validatedUserId },
    data: { role: validatedRole },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function suspendUser(userId: string, reason?: string) {
  await requireAdmin();

  // Validate input
  const validationResult = suspendUserSchema.safeParse({ userId, reason });
  if (!validationResult.success) {
    throw new Error(
      `Invalid input: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
    );
  }

  const { userId: validatedUserId, reason: validatedReason } =
    validationResult.data;

  // Sanitize reason if provided
  const sanitizedReason = validatedReason
    ? sanitizeForDisplay(validatedReason)
    : 'Policy violation';

  // Get user info first
  const user = await database.user.findUnique({
    where: { id: validatedUserId },
    select: { id: true, firstName: true, lastName: true, suspended: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.suspended) {
    throw new Error('User is already suspended');
  }

  // Update user suspended status
  await database.user.update({
    where: { id: validatedUserId },
    data: {
      suspended: true,
      suspendedAt: new Date(),
      suspendedReason: sanitizedReason,
    },
  });

  // Mark all user's products as removed
  await database.product.updateMany({
    where: { sellerId: validatedUserId },
    data: { status: 'REMOVED' },
  });

  // Cancel active orders where user is seller
  await database.order.updateMany({
    where: {
      sellerId: validatedUserId,
      status: { in: ['PENDING', 'PAID'] },
    },
    data: {
      status: 'CANCELLED',
    },
  });

  // Send notification to user
  await database.notification.create({
    data: {
      userId: validatedUserId,
      title: 'Account Suspended',
      message:
        'Your account has been suspended due to policy violations. All active listings have been removed and pending orders cancelled. Contact support for more information.',
      type: 'SYSTEM',
      metadata: JSON.stringify({
        action: 'suspended',
        reason: sanitizedReason,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function unsuspendUser(userId: string) {
  await requireAdmin();

  // Get user info first
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, suspended: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.suspended) {
    throw new Error('User is not suspended');
  }

  // Update user suspended status
  await database.user.update({
    where: { id: userId },
    data: {
      suspended: false,
      suspendedAt: null,
      suspendedReason: null,
    },
  });

  // Restore user's products that were removed due to suspension
  await database.product.updateMany({
    where: {
      sellerId: userId,
      status: 'REMOVED',
    },
    data: { status: 'AVAILABLE' },
  });

  // Send notification to user
  await database.notification.create({
    data: {
      userId,
      title: 'Account Restored',
      message:
        'Your account has been restored. You can now access all platform features and your listings have been made available again.',
      type: 'SYSTEM',
      metadata: JSON.stringify({
        action: 'unsuspended',
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function verifyUser(userId: string) {
  await requireAdmin();

  // Get user info first
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, verified: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.verified) {
    throw new Error('User is already verified');
  }

  await database.user.update({
    where: { id: userId },
    data: { verified: true },
  });

  // Send verification notification to user
  await database.notification.create({
    data: {
      userId,
      title: 'Account Verified',
      message:
        'Congratulations! Your account has been verified. You now have access to all platform features and enhanced seller benefits.',
      type: 'SYSTEM',
      metadata: JSON.stringify({
        action: 'verified',
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function bulkUpdateUsers({
  userIds,
  action,
}: {
  userIds: string[];
  action: 'suspend' | 'unsuspend' | 'verify';
}) {
  await requireAdmin();

  // Validate input
  const validationResult = bulkOperationSchema.safeParse({
    ids: userIds,
    action,
    data: {},
  });
  if (!validationResult.success) {
    throw new Error(
      `Invalid input: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
    );
  }

  const { ids: validatedUserIds } = validationResult.data;

  if (validatedUserIds.length === 0) {
    throw new Error('No users selected');
  }

  try {
    // Get users info for notifications
    const users = await database.user.findMany({
      where: { id: { in: validatedUserIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        suspended: true,
        verified: true,
      },
    });

    const results = { success: 0, skipped: 0, errors: 0 };

    for (const user of users) {
      try {
        switch (action) {
          case 'suspend':
            if (user.suspended) {
              results.skipped++;
              continue;
            }

            // Update user suspended status
            await database.user.update({
              where: { id: user.id },
              data: {
                suspended: true,
                suspendedAt: new Date(),
                suspendedReason: 'Bulk moderation action',
              },
            });

            // Mark all user's products as removed
            await database.product.updateMany({
              where: { sellerId: user.id },
              data: { status: 'REMOVED' },
            });

            // Cancel active orders where user is seller
            await database.order.updateMany({
              where: {
                sellerId: user.id,
                status: { in: ['PENDING', 'PAID'] },
              },
              data: {
                status: 'CANCELLED',
              },
            });

            // Send notification
            await database.notification.create({
              data: {
                userId: user.id,
                title: 'Account Suspended',
                message:
                  'Your account has been suspended. All active listings have been removed and pending orders cancelled. Contact support for more information.',
                type: 'SYSTEM',
                metadata: JSON.stringify({
                  action: 'suspended',
                  reason: 'Bulk moderation action',
                  timestamp: new Date().toISOString(),
                }),
              },
            });
            break;

          case 'unsuspend':
            if (!user.suspended) {
              results.skipped++;
              continue;
            }

            // Update user suspended status
            await database.user.update({
              where: { id: user.id },
              data: {
                suspended: false,
                suspendedAt: null,
                suspendedReason: null,
              },
            });

            // Restore user's products
            await database.product.updateMany({
              where: {
                sellerId: user.id,
                status: 'REMOVED',
              },
              data: { status: 'AVAILABLE' },
            });

            // Send notification
            await database.notification.create({
              data: {
                userId: user.id,
                title: 'Account Restored',
                message:
                  'Your account has been restored. You can now access all platform features and your listings have been made available again.',
                type: 'SYSTEM',
                metadata: JSON.stringify({
                  action: 'unsuspended',
                  timestamp: new Date().toISOString(),
                }),
              },
            });
            break;

          case 'verify':
            if (user.verified) {
              results.skipped++;
              continue;
            }

            await database.user.update({
              where: { id: user.id },
              data: { verified: true },
            });

            // Send verification notification
            await database.notification.create({
              data: {
                userId: user.id,
                title: 'Account Verified',
                message:
                  'Congratulations! Your account has been verified. You now have access to all platform features and enhanced seller benefits.',
                type: 'SYSTEM',
                metadata: JSON.stringify({
                  action: 'verified',
                  timestamp: new Date().toISOString(),
                }),
              },
            });
            break;
        }

        results.success++;
      } catch (error) {
        logError(`Failed to ${action} user ${user.id}:`, error);
        results.errors++;
      }
    }

    revalidatePath('/admin/users');
    return {
      success: true,
      results,
      message: `Bulk ${action}: ${results.success} successful, ${results.skipped} skipped, ${results.errors} errors`,
    };
  } catch (error) {
    logError('Bulk update failed:', error);
    throw new Error(`Failed to ${action} users`);
  }
}
