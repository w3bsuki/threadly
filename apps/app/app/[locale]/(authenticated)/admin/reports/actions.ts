'use server';

import { canModerate } from '@repo/auth/admin';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function resolveReport(reportId: string, resolution: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }

  const user = await currentUser();
  const moderator = await database.user.findUnique({
    where: { clerkId: user!.id },
    select: { id: true }
  });

  // Get the report details
  const report = await database.report.findUnique({
    where: { id: reportId },
    include: {
      Product: true,
      User_Report_reportedUserIdToUser: true,
    }
  });

  if (!report) {
    throw new Error('Report not found');
  }

  // Update report status
  await database.report.update({
    where: { id: reportId },
    data: {
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolvedBy: moderator!.id,
      resolution,
    }
  });

  // Take action based on the report type and resolution
  if (resolution === 'APPROVED') {
    if (report.type === 'PRODUCT' && report.Product) {
      // Remove the product
      await database.product.update({
        where: { id: report.Product.id },
        data: { status: 'REMOVED' }
      });

      // Notify the seller
      await database.notification.create({
        data: {
          id: randomUUID(),
          userId: report.Product.sellerId,
          title: 'Product Removed',
          message: `Your product "${report.Product.title}" has been removed due to policy violations.`,
          type: 'SYSTEM',
          metadata: JSON.stringify({
            productId: report.Product.id,
            reportId: report.id,
            reason: report.reason,
          }),
        },
      });
    } else if (report.type === 'USER' && report.User_Report_reportedUserIdToUser) {
      // Suspend the user
      await database.user.update({
        where: { id: report.User_Report_reportedUserIdToUser.id },
        data: {
          suspended: true,
          suspendedAt: new Date(),
          suspendedReason: report.reason,
        }
      });

      // Notify the user
      await database.notification.create({
        data: {
          id: randomUUID(),
          userId: report.User_Report_reportedUserIdToUser.id,
          title: 'Account Suspended',
          message: 'Your account has been suspended due to policy violations.',
          type: 'SYSTEM',
          metadata: JSON.stringify({
            reportId: report.id,
            reason: report.reason,
          }),
        },
      });
    }
  }
  
  revalidatePath('/admin/reports');
  return { success: true };
}

export async function dismissReport(reportId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }

  const user = await currentUser();
  const moderator = await database.user.findUnique({
    where: { clerkId: user!.id },
    select: { id: true }
  });
  
  // Update report status to dismissed
  await database.report.update({
    where: { id: reportId },
    data: {
      status: 'DISMISSED',
      resolvedAt: new Date(),
      resolvedBy: moderator!.id,
      resolution: 'Report dismissed - no action required',
    }
  });
  
  revalidatePath('/admin/reports');
  return { success: true };
}

export async function escalateReport(reportId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }
  
  // Update report status to under review
  await database.report.update({
    where: { id: reportId },
    data: {
      status: 'UNDER_REVIEW',
    }
  });

  // Notify all admins
  const admins = await database.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true }
  });

  const notifications = admins.map(admin => ({
    id: randomUUID(),
    userId: admin.id,
    title: 'Report Escalated',
    message: `A report requires admin review. Report ID: ${reportId}`,
    type: 'SYSTEM' as const,
    metadata: JSON.stringify({
      reportId,
      action: 'escalated',
    }),
  }));

  if (notifications.length > 0) {
    await database.notification.createMany({
      data: notifications,
    });
  }
  
  revalidatePath('/admin/reports');
  return { success: true };
}