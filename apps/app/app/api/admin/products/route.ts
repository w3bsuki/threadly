import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { validatePaginationParams, buildCursorWhere, processPaginationResult } from '@repo/design-system/lib/pagination';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    // Verify user is authenticated and is admin
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user to check admin role
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse pagination and filter parameters
    const searchParams = request.nextUrl.searchParams;
    const pagination = validatePaginationParams(searchParams);
    const search = searchParams.get('q') || '';
    const statusFilter = searchParams.get('status') || 'all';

    // Build where clause with proper types
    interface WhereClause {
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
      status?: string;
    }
    
    const where: WhereClause = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase();
    }

    // Fetch products with pagination
    const products = await database.product.findMany({
      where: {
        ...where,
        ...buildCursorWhere(pagination.cursor),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: true,
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1
        },
        _count: {
          select: {
            favorites: true,
            orders: true
          }
        }
      },
      take: pagination.limit,
    });

    // Process pagination result
    const result = processPaginationResult(products, pagination.limit);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}