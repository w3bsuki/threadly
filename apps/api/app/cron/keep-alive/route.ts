import { log, logError } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest): Promise<Response> => {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple keep-alive logic - you can customize this
    log.info('Keep-alive cron job executed successfully');

    return NextResponse.json({
      message: 'Keep-alive cron executed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError('Keep-alive cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
