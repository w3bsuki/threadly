import { currentUser } from '@repo/auth/server';
import { getPusherServer } from '@repo/features/notifications/src/realtime/server/pusher-server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channel = params.get('channel_name');

    if (!(socketId && channel)) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    const pusherServer = getPusherServer({
      pusherAppId: process.env.PUSHER_APP_ID || '',
      pusherKey: process.env.PUSHER_KEY || '',
      pusherSecret: process.env.PUSHER_SECRET || '',
      pusherCluster: process.env.PUSHER_CLUSTER || '',
    });

    const auth = await pusherServer.authenticateUser(
      socketId,
      channel,
      user.id
    );

    return NextResponse.json(auth);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
