import { log } from '@repo/observability/server';
import { type NextRequest, NextResponse } from 'next/server';

interface WebVitalsPayload {
  metric: {
    name: string;
    value: number;
    id: string;
    delta: number;
  };
  pathname: string;
  userAgent: string;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as WebVitalsPayload;

    // Log web vitals for monitoring
    log.info('Web Vitals Metric', {
      metric: data.metric.name,
      value: data.metric.value,
      rating: data.rating,
      pathname: data.pathname,
      timestamp: data.timestamp,
      userAgent: data.userAgent.substring(0, 100), // Truncate for logging
    } as Record<string, unknown>);

    // Store in database for analytics (optional)
    // You could save this to a metrics table for trend analysis

    // Send to external monitoring service (optional)
    // await sendToDatadog(data);
    // await sendToNewRelic(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Web Vitals API error:', error as Record<string, unknown>);
    return NextResponse.json(
      { error: 'Failed to process web vitals data' },
      { status: 500 }
    );
  }
}

// Helper function to aggregate metrics for reporting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pathname = searchParams.get('pathname');
    const timeRange = searchParams.get('timeRange') || '24h';

    // In a real implementation, you'd query your metrics database
    // For now, return mock aggregated data
    const mockData = {
      pathname: pathname || 'all',
      timeRange,
      metrics: {
        LCP: { avg: 2.1, p75: 2.8, p95: 4.2, good: 75, poor: 10 },
        FID: { avg: 45, p75: 62, p95: 120, good: 85, poor: 5 },
        CLS: { avg: 0.08, p75: 0.12, p95: 0.25, good: 80, poor: 8 },
        FCP: { avg: 1.6, p75: 2.1, p95: 3.2, good: 78, poor: 12 },
      },
      sampleSize: 1000,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(mockData);
  } catch (error) {
    log.error('Web Vitals aggregation error:', error as Record<string, unknown>);
    return NextResponse.json(
      { error: 'Failed to fetch web vitals data' },
      { status: 500 }
    );
  }
}
