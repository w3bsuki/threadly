import { currentUser } from '@repo/auth/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

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
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
