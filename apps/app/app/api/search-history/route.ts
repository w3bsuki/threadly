import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent search history
    const searchHistory = await database.searchHistory.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      distinct: ['query'], // Get unique queries
    });

    return NextResponse.json({ searchHistory });
  } catch (error) {
    logError('Error fetching search history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, filters, resultCount } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create search history entry
    await database.searchHistory.create({
      data: {
        userId: dbUser.id,
        query: query.toLowerCase(),
        filters: filters || undefined,
        resultCount: resultCount || 0,
      },
    });

    // Clean up old search history (keep last 50 entries)
    const oldEntries = await database.searchHistory.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      skip: 50,
      select: { id: true },
    });

    if (oldEntries.length > 0) {
      await database.searchHistory.deleteMany({
        where: {
          id: { in: oldEntries.map(e => e.id) }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error creating search history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clear all search history for the user
    await database.searchHistory.deleteMany({
      where: { userId: dbUser.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error clearing search history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}