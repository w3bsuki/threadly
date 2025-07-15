import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';
import { log } from '@repo/observability/server';

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().optional(),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']).optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  basePrice: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  isDefault: z.boolean().optional()
});

const updateTemplateSchema = createTemplateSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const templates = await database.productTemplate.findMany({
      where: { userId: dbUser.id },
      orderBy: [
        { isDefault: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: Math.min(limit, 50)
    });

    return NextResponse.json({ templates });

  } catch (error) {
    log.error('Get templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validationResult = createTemplateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // If setting as default, unset other defaults first
    if (data.isDefault) {
      await database.productTemplate.updateMany({
        where: { 
          userId: dbUser.id,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const template = await database.productTemplate.create({
      data: {
        userId: dbUser.id,
        name: data.name,
        description: data.description,
        category: data.category,
        condition: data.condition,
        brand: data.brand,
        size: data.size,
        color: data.color,
        basePrice: data.basePrice,
        tags: data.tags || [],
        metadata: data.metadata,
        isDefault: data.isDefault || false
      }
    });

    return NextResponse.json({ success: true, template }, { status: 201 });

  } catch (error) {
    log.error('Create template API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}