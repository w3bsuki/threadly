import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Get geo data from headers
  const country = req.headers.get('x-vercel-ip-country') || 
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