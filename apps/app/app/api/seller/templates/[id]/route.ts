import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: Add ProductTemplate model to database schema
  return NextResponse.json({ error: 'Templates not implemented' }, { status: 501 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: Add ProductTemplate model to database schema
  return NextResponse.json({ error: 'Templates not implemented' }, { status: 501 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: Add ProductTemplate model to database schema
  return NextResponse.json({ error: 'Templates not implemented' }, { status: 501 });
}