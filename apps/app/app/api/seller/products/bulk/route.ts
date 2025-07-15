import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { generalApiLimit, checkRateLimit } from '@repo/security';

const bulkOperationSchema = z.object({
  productIds: z.array(z.string().cuid()).min(1).max(100),
  operation: z.enum([
    'PRICE_UPDATE',
    'STATUS_CHANGE', 
    'CATEGORY_UPDATE',
    'CONDITION_UPDATE',
    'BRAND_UPDATE',
    'SIZE_UPDATE',
    'COLOR_UPDATE'
  ]),
  data: z.object({
    price: z.number().positive().optional(),
    status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'REMOVED']).optional(),
    categoryId: z.string().cuid().optional(),
    condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']).optional(),
    brand: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    // Check rate limit for bulk operations
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

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
    const validationResult = bulkOperationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { productIds, operation, data } = validationResult.data;

    // Verify all products belong to the seller
    const products = await database.product.findMany({
      where: { 
        id: { in: productIds },
        sellerId: dbUser.id
      },
      select: { id: true, title: true }
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some products do not belong to you' },
        { status: 403 }
      );
    }

    // Create bulk operation record
    const bulkOperation = await database.bulkOperation.create({
      data: {
        userId: dbUser.id,
        type: operation,
        status: 'PENDING',
        totalItems: productIds.length,
        parameters: {
          productIds,
          operation,
          data
        }
      }
    });

    try {
      let updateData: any = {};
      let results = { success: 0, errors: 0, skipped: 0 };

      // Prepare update data based on operation type
      switch (operation) {
        case 'PRICE_UPDATE':
          if (!data.price) {
            throw new Error('Price is required for price update');
          }
          updateData = { price: data.price };
          break;
        case 'STATUS_CHANGE':
          if (!data.status) {
            throw new Error('Status is required for status change');
          }
          updateData = { status: data.status };
          break;
        case 'CATEGORY_UPDATE':
          if (!data.categoryId) {
            throw new Error('Category ID is required for category update');
          }
          updateData = { categoryId: data.categoryId };
          break;
        case 'CONDITION_UPDATE':
          if (!data.condition) {
            throw new Error('Condition is required for condition update');
          }
          updateData = { condition: data.condition };
          break;
        case 'BRAND_UPDATE':
          updateData = { brand: data.brand };
          break;
        case 'SIZE_UPDATE':
          updateData = { size: data.size };
          break;
        case 'COLOR_UPDATE':
          updateData = { color: data.color };
          break;
        default:
          throw new Error('Invalid operation type');
      }

      // Process each product individually for better error tracking
      for (const product of products) {
        try {
          await database.product.update({
            where: { id: product.id },
            data: updateData
          });
          results.success++;
        } catch (error) {
          log.error(`Failed to update product ${product.id}:`, error);
          results.errors++;
        }
      }

      // Update bulk operation status
      await database.bulkOperation.update({
        where: { id: bulkOperation.id },
        data: {
          status: 'COMPLETED',
          processedItems: results.success + results.errors,
          successCount: results.success,
          errorCount: results.errors,
          completedAt: new Date(),
          errors: results.errors > 0 ? { details: 'Some items failed to update' } : null
        }
      });

      return NextResponse.json({ 
        success: true, 
        results,
        operationId: bulkOperation.id,
        message: `Bulk update: ${results.success} successful, ${results.errors} errors`
      });

    } catch (error) {
      // Mark operation as failed
      await database.bulkOperation.update({
        where: { id: bulkOperation.id },
        data: {
          status: 'FAILED',
          errors: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      });
      
      log.error('Bulk operation failed:', error);
      return NextResponse.json(
        { error: 'Failed to perform bulk update' },
        { status: 500 }
      );
    }

  } catch (error) {
    log.error('Bulk operation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error?.message || 'Rate limit exceeded' },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

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
    const limit = parseInt(searchParams.get('limit') || '10');
    const operationId = searchParams.get('operationId');

    if (operationId) {
      // Get specific operation status
      const operation = await database.bulkOperation.findFirst({
        where: {
          id: operationId,
          userId: dbUser.id
        }
      });

      if (!operation) {
        return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
      }

      return NextResponse.json(operation);
    } else {
      // Get user's bulk operations history
      const operations = await database.bulkOperation.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 50) // Cap at 50 for performance
      });

      return NextResponse.json({ operations });
    }

  } catch (error) {
    log.error('Get bulk operations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}