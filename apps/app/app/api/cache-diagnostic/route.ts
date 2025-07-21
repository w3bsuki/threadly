import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  const webUrl = env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
  const adminSecret = env.ADMIN_SECRET || 'default-admin-secret';
  
  try {
    // Test connection to web app's cache clearing endpoint
    const testResponse = await fetch(`${webUrl}/api/admin/cache-health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminSecret}`,
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    const isHealthy = testResponse.ok;
    const healthData = isHealthy ? await testResponse.json() : null;
    
    return NextResponse.json({
      diagnostic: {
        timestamp: new Date().toISOString(),
        configuration: {
          webUrl,
          hasAdminSecret: !!env.ADMIN_SECRET,
          adminSecretLength: adminSecret.length,
        },
        cacheEndpoint: {
          url: `${webUrl}/api/admin/clear-cache`,
          healthCheckUrl: `${webUrl}/api/admin/cache-health`,
          reachable: isHealthy,
          statusCode: testResponse.status,
          healthData,
        },
        recommendations: [
          !env.NEXT_PUBLIC_WEB_URL && 'NEXT_PUBLIC_WEB_URL is not set in environment variables',
          !env.ADMIN_SECRET && 'ADMIN_SECRET is not set in environment variables',
          !isHealthy && `Cannot reach web app at ${webUrl}. Check if the URL is correct.`,
          testResponse.status === 401 && 'Authentication failed. Check if ADMIN_SECRET matches between apps.',
        ].filter(Boolean),
      }
    });
  } catch (error) {
    return NextResponse.json({
      diagnostic: {
        timestamp: new Date().toISOString(),
        configuration: {
          webUrl,
          hasAdminSecret: !!env.ADMIN_SECRET,
        },
        cacheEndpoint: {
          url: `${webUrl}/api/admin/clear-cache`,
          reachable: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        recommendations: [
          'Failed to connect to web app. Check network connectivity and URL configuration.',
          `Current web URL: ${webUrl}`,
          'Verify this URL is correct and the web app is running.',
        ],
      }
    }, { status: 503 });
  }
}