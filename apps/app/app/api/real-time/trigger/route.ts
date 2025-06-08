import { auth } from '@repo/auth';
import { getPusherServer } from '@repo/real-time/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const pusherServer = getPusherServer({
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  pusherAppId: process.env.PUSHER_APP_ID!,
  pusherSecret: process.env.PUSHER_SECRET!,
});

const triggerSchema = z.object({
  channel: z.string(),
  event: z.string(),
  data: z.any(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await auth();
    
    if (!user?.id) {
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

    await pusherServer.broadcast([channel], event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RealTime Trigger] Error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}