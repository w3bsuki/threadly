import { currentUser } from '@repo/auth/server';
import { NextRequest, NextResponse } from 'next/server';

// Initialize on first request to avoid build-time errors
let pusherServer: any;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return mock auth for now since Pusher is not configured
    return NextResponse.json({
      auth: 'mock-auth-token',
      channel_data: JSON.stringify({
        user_id: user.id,
        user_info: {
          name: `${user.firstName} ${user.lastName}`,
        },
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}