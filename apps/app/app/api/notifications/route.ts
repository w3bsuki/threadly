import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';

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
      // Return empty for now if user not found
      return NextResponse.json({
        data: [],
        meta: {
          page: 1,
          limit: 50,
          total: 0,
          unreadCount: 0,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // For now, return empty notifications
    // TODO: Implement actual notification system
    return NextResponse.json({
      data: [],
      meta: {
        page,
        limit,
        total: 0,
        unreadCount: 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}