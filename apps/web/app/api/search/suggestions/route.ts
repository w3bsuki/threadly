import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';

const searchSuggestionsSchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, 'Query must be at least 2 characters')
    .max(100)
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    }),
});

export async function GET(request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const validation = searchSuggestionsSchema.safeParse({
    q: searchParams.get('q') || '',
  });

  if (!validation.success) {
    return NextResponse.json([]);
  }

  const { q: query } = validation.data;

  try {
    const searchTerm = query.toLowerCase().trim();

    interface Suggestion {
      id: string;
      title: string;
      type: 'product' | 'brand' | 'category';
      brand?: string | null;
      category?: string;
    }

    const suggestions: Suggestion[] = [];

    // Get product suggestions (top 3)
    const products = await database.product.findMany({
      where: {
        status: 'AVAILABLE',
        title: {
          contains: searchTerm,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    });

    // Add product suggestions
    products.forEach((product) => {
      suggestions.push({
        id: product.id,
        title: product.title,
        type: 'product',
        brand: product.brand,
        category: product.category?.name,
      });
    });

    // Get brand suggestions (top 2)
    const brands = await database.product.groupBy({
      by: ['brand'],
      where: {
        status: 'AVAILABLE',
        brand: {
          not: null,
          contains: searchTerm,
        },
      },
      _count: {
        brand: true,
      },
      orderBy: {
        _count: {
          brand: 'desc',
        },
      },
      take: 2,
    });

    // Add brand suggestions
    brands.forEach((brand, index) => {
      if (brand.brand) {
        suggestions.push({
          id: `brand-${index}`,
          title: brand.brand,
          type: 'brand',
        });
      }
    });

    // Get category suggestions (top 2)
    const categories = await database.category.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      include: {
        _count: {
          select: {
            Product: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: 2,
    });

    // Add category suggestions
    categories.forEach((category) => {
      suggestions.push({
        id: category.id,
        title: category.name,
        type: 'category',
      });
    });

    // Limit total suggestions and return
    return NextResponse.json(suggestions.slice(0, 7));
  } catch (error) {
    logError('Suggestions error:', error);
    return NextResponse.json([]);
  }
}
