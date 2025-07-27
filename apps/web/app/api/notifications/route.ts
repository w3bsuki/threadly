import { auth } from '@clerk/nextjs/server';
import { z } from '@repo/validation';
import { NextResponse } from 'next/server';

const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const validation = notificationQuerySchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { page, limit } = validation.data;

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
