import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/observability/log';

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
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    log.error('Keep-alive cron job failed:', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}; 