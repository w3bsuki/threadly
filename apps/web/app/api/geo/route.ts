import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get geo data from headers
  const country =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    undefined;

  const city = req.headers.get('x-vercel-ip-city') || undefined;
  const region = req.headers.get('x-vercel-ip-country-region') || undefined;

  return NextResponse.json({
    country,
    city,
    region,
  });
}
