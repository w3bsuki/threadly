import { currentUser } from '@repo/auth/server';
import { getPusherServer } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

// Initialize on first request to avoid build-time errors
let pusherServer: any;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Initialize Pusher on first request
    if (!pusherServer) {
      if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
        return NextResponse.json(
          { error: 'Real-time service not configured' },
          { status: 503 }
        );
      }
      
      pusherServer = getPusherServer({
        pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
        pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        pusherAppId: process.env.PUSHER_APP_ID!,
        pusherSecret: process.env.PUSHER_SECRET!,
      });
    }

    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    // Authenticate the user for the channel
    const authResponse = await pusherServer.authenticateUser(
      socketId,
      channel,
      user.id
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    logError('[RealTime Auth] Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}