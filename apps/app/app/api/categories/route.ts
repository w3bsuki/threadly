import { createErrorResponse, createSuccessResponse } from '@repo/utils/api';
import { database } from '@repo/database';

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
      meta: { count: categories.length },
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
