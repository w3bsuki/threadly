import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { getNotificationService } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';
import { queryParamsSchema, sanitizeForDisplay } from '@repo/validation';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user from Clerk ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const unreadOnly = searchParams.get('unread') === 'true';

    // Validate query parameters
    const queryValidation = queryParamsSchema.safeParse({ page, limit });
    if (!queryValidation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: queryValidation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }, 
        { status: 400 }
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

    return NextResponse.json({
      notifications,
      unreadCount,
      page: validatedPage,
      limit: validatedLimit,
    });
  } catch (error) {
    logError('[Notifications GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user from Clerk ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // This would need admin check in real implementation
    const body = await request.json();
    
    // Validate input with Zod schema
    const validationResult = createNotificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }, 
        { status: 400 }
      );
    }

    const { title, message, type, metadata } = validationResult.data;

    // Sanitize user inputs
    const sanitizedData = {
      title: sanitizeForDisplay(title),
      message: sanitizeForDisplay(message),
      type,
      metadata,
    };

    const notificationService = getNotificationService();
    const notification = await notificationService.notify(dbUser.id, sanitizedData);

    return NextResponse.json(notification);
  } catch (error) {
    logError('[Notifications POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}