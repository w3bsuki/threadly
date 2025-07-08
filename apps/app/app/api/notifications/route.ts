import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { getNotificationService } from '@repo/real-time/server';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { queryParamsSchema, sanitizeForDisplay } from '@repo/validation';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateRequest,
  ErrorCode,
  createPaginationMeta
} from '@repo/api-utils';

const createNotificationSchema = z.object({
  title: z.string().trim().min(1).max(255)
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    }),
  message: z.string().trim().min(1).max(1000)
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    }),
  type: z.enum(['order', 'message', 'payment', 'system']),
  metadata: z.record(z.any()).optional(),
});

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return createErrorResponse(
        new Error('Unauthorized'),
        { status: 401, errorCode: ErrorCode.UNAUTHORIZED }
      );
    }

    // Get database user from Clerk ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        new Error('User not found'),
        { status: 404, errorCode: ErrorCode.NOT_FOUND }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Validate query parameters
    const queryValidation = queryParamsSchema.safeParse({ page, limit });
    if (!queryValidation.success) {
      return createErrorResponse(
        new Error('Invalid query parameters'),
        { 
          status: 400, 
          errorCode: ErrorCode.VALIDATION_FAILED,
          details: queryValidation.error.errors 
        }
      );
    }

    const { page: validatedPage, limit: validatedLimit } = queryValidation.data;

    const notifications = await database.notification.findMany({
      where: {
        userId: dbUser.id,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
    });

    const notificationService = getNotificationService();
    const unreadCount = await notificationService.getUnreadCount(dbUser.id);

    return createSuccessResponse(notifications, {
      pagination: createPaginationMeta(validatedPage, validatedLimit, await database.notification.count({
        where: {
          userId: dbUser.id,
          ...(unreadOnly && { read: false }),
        }
      })),
      meta: { unreadCount }
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return createErrorResponse(
        new Error('Unauthorized'),
        { status: 401, errorCode: ErrorCode.UNAUTHORIZED }
      );
    }

    // Get database user from Clerk ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        new Error('User not found'),
        { status: 404, errorCode: ErrorCode.NOT_FOUND }
      );
    }

    // This would need admin check in real implementation
    const body = await request.json();
    
    // Validate input with helper function
    const validatedData = validateRequest(body, createNotificationSchema);
    if (!validatedData.success) {
      return createErrorResponse(
        new Error('Invalid input'),
        { 
          status: 400, 
          errorCode: ErrorCode.VALIDATION_FAILED,
          details: validatedData.errors
        }
      );
    }

    const { title, message, type, metadata } = validatedData.data;

    // Sanitize user inputs
    const sanitizedData = {
      title: sanitizeForDisplay(title),
      message: sanitizeForDisplay(message),
      type,
      metadata,
    };

    const notificationService = getNotificationService();
    const notification = await notificationService.notify(dbUser.id, sanitizedData);

    return createSuccessResponse(notification);
  } catch (error) {
    return createErrorResponse(error);
  }
}