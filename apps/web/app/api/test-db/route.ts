import { database } from '@repo/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple database query to test connection
    const count = await database.product.count();
    
    return NextResponse.json({
      success: true,
      productCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}