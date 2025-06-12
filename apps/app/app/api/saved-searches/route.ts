import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log } from '@repo/observability/log';
import { logError } from '@repo/observability/error';

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

    const savedSearches = await database.savedSearch.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ savedSearches });
  } catch (error) {
    logError('Error fetching saved searches:', error);
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
    const { name, query, filters, alertEnabled } = body;

    // Validate input
    if (!name || !query) {
      return NextResponse.json({ error: 'Name and query are required' }, { status: 400 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has this search saved
    const existingSearch = await database.savedSearch.findFirst({
      where: {
        userId: dbUser.id,
        query: query.toLowerCase(),
        filters: filters as any,
      }
    });

    if (existingSearch) {
      return NextResponse.json({ error: 'You already have this search saved' }, { status: 400 });
    }

    // Create saved search
    const savedSearch = await database.savedSearch.create({
      data: {
        userId: dbUser.id,
        name,
        query: query.toLowerCase(),
        filters: filters || undefined,
        alertEnabled: alertEnabled ?? true,
      },
    });

    return NextResponse.json({ savedSearch });
  } catch (error) {
    logError('Error creating saved search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Search ID is required' }, { status: 400 });
    }

    // Get user's database ID
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete saved search (only if it belongs to the user)
    const result = await database.savedSearch.deleteMany({
      where: {
        id,
        userId: dbUser.id,
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Saved search not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error deleting saved search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}