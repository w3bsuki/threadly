import { database } from '@repo/database';
import { createSuccessResponse, createErrorResponse } from '@repo/api-utils';

export async function GET() {
  try {
    const categories = await database.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return createSuccessResponse(categories, {
      meta: { count: categories.length }
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}