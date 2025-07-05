import { NextResponse } from 'next/server';
import { database } from '@repo/database';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function GET() {
  try {
    const categories = await database.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error) {
    logError('Categories fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        categories: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}