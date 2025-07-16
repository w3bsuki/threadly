import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // TODO: Add ProductTemplate model to database schema
  return NextResponse.json({ error: 'Templates not implemented' }, { status: 501 });
}

export async function POST(request: NextRequest) {
  // TODO: Add ProductTemplate model to database schema
  return NextResponse.json({ error: 'Templates not implemented' }, { status: 501 });
}