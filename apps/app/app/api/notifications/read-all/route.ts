import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/observability/server';
import { getNotificationService } from '@repo/real-time/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
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

    const notificationService = getNotificationService();
    await notificationService.markAllAsRead(dbUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('[Notifications Mark All Read] Error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
