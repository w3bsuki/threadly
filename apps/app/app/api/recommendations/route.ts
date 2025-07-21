import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { getRecommendations } from './engine';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'PERSONALIZED';
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Generate new recommendations
    const recommendations = await getRecommendations({
      userId: dbUser.id,
      type: type as any,
      productId,
      limit,
    });

    return NextResponse.json({
      recommendations,
      fromCache: false,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}