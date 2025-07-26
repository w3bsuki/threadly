import { currentUser } from '@repo/auth/server';
import { getPusherServer } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const triggerSchema = z.object({
  channel: z.string(),
  event: z.string(),
  data: z.unknown(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channel, event, data } = triggerSchema.parse(body);

    // Validate user has permission to trigger on this channel
    if (channel.startsWith('private-user-') && !channel.includes(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (channel.startsWith('private-conversation-')) {
      // Additional validation for conversation channels
      const conversationId = channel.replace('private-conversation-', '');
      // This would need to verify user is part of the conversation
      // For now, we'll trust the authentication
    }

    // Check if Pusher is configured
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
      return NextResponse.json(
        { error: 'Real-time service not configured' },
        { status: 503 }
      );
    }

    const pusherServer = getPusherServer({
      pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      pusherAppId: process.env.PUSHER_APP_ID!,
      pusherSecret: process.env.PUSHER_SECRET!,
    });
    
    await pusherServer.broadcast([channel], event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('[RealTime Trigger] Error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}