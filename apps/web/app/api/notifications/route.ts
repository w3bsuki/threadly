import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // For now, return empty notifications until we implement the full system
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
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}