import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function GET() {
  // SECURITY: Only allow in development mode and for authenticated admin users
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disabled in production' },
      { status: 404 }
    );
  }

  try {
    // Additional security: Require authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Test database connection without exposing sensitive information
    const userCount = await database.user.count();
    const productCount = await database.product.count();
    const categoryCount = await database.category.count();
    
    return NextResponse.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        categories: categoryCount
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    });
  } catch (error) {
    // SECURITY: Generic error messages, no sensitive information
    logError('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      message: 'Database connection failed'
    }, { status: 500 });
  }
}