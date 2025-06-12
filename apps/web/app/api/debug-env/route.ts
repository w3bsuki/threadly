import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WEB_URL: env.NEXT_PUBLIC_WEB_URL,
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    actual_host: process.env.VERCEL_URL || 'not-vercel',
  });
}