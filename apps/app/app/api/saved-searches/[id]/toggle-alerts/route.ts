import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alertEnabled } = body;

    if (typeof alertEnabled !== 'boolean') {
      return NextResponse.json({ error: 'alertEnabled must be a boolean' }, { status: 400 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update saved search (only if it belongs to the user)
    const result = await database.savedSearch.updateMany({
      where: {
        id: resolvedParams.id,
        userId: dbUser.id,
      },
      data: {
        alertEnabled,
        updatedAt: new Date(),
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error updating saved search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}