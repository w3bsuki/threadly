import { auth } from '@repo/auth/server';
import { log, logError } from '@repo/tooling/observability/server';
import { type AlgoliaSearchService, getSearchService } from '@repo/tooling/utils/src/search';
import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';

let searchService: AlgoliaSearchService;

const popularProductsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize search service on first request
    if (!searchService) {
      if (!(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_ADMIN_API_KEY)) {
        return NextResponse.json(
          { error: 'Search service not configured' },
          { status: 503 }
        );
      }

      searchService = getSearchService({
        appId: process.env.ALGOLIA_APP_ID!,
        apiKey: process.env.ALGOLIA_ADMIN_API_KEY!,
        searchOnlyApiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!,
        indexName: process.env.ALGOLIA_INDEX_NAME!,
      });
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const validation = popularProductsSchema.safeParse({
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { limit } = validation.data;

    const products = await searchService.getPopularProducts(limit);
    return NextResponse.json(products);
  } catch (error) {
    logError('[Search Popular API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get popular products' },
      { status: 500 }
    );
  }
}
