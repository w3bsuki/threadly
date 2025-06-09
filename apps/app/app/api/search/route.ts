import { NextRequest, NextResponse } from 'next/server';
import { getSearchService } from '@repo/search';
import { z } from 'zod';

let searchService: ReturnType<typeof getSearchService> | null = null;

const searchRequestSchema = z.object({
  filters: z.object({
    query: z.string().optional(),
    categories: z.array(z.string()).optional(),
    brands: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    materials: z.array(z.string()).optional(),
    priceRange: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
    sellerRating: z.number().optional(),
    availableForTrade: z.boolean().optional(),
    location: z.string().optional(),
    sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'most_viewed', 'most_favorited']).optional(),
  }),
  page: z.number().default(0),
  hitsPerPage: z.number().max(100).default(20),
});

export async function POST(request: NextRequest) {
  try {
    // Initialize search service on first request
    if (!searchService) {
      const appId = process.env.ALGOLIA_APP_ID;
      const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
      const searchOnlyApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
      const indexName = process.env.ALGOLIA_INDEX_NAME;

      if (!appId || !apiKey || !searchOnlyApiKey || !indexName) {
        console.error('[Search API] Missing required environment variables');
        return NextResponse.json(
          { error: 'Search service not configured' },
          { status: 503 }
        );
      }

      searchService = getSearchService({
        appId,
        apiKey,
        searchOnlyApiKey,
        indexName,
      });
    }

    const body = await request.json();
    const { filters, page, hitsPerPage } = searchRequestSchema.parse(body);

    const result = await searchService.search(filters, page, hitsPerPage);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Search API] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Initialize search service on first request
    if (!searchService) {
      const appId = process.env.ALGOLIA_APP_ID;
      const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
      const searchOnlyApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
      const indexName = process.env.ALGOLIA_INDEX_NAME;

      if (!appId || !apiKey || !searchOnlyApiKey || !indexName) {
        console.error('[Search API] Missing required environment variables');
        return NextResponse.json(
          { error: 'Search service not configured' },
          { status: 503 }
        );
      }

      searchService = getSearchService({
        appId,
        apiKey,
        searchOnlyApiKey,
        indexName,
      });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const condition = searchParams.get('condition');
    const sortBy = searchParams.get('sortBy') as any;

    const filters: any = { query };
    
    if (category) filters.categories = [category];
    if (brand) filters.brands = [brand];
    if (condition) filters.conditions = [condition];
    if (sortBy) filters.sortBy = sortBy;

    const result = await searchService.search(filters, page);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}