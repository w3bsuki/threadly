import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs';
import { getSearchService } from '@repo/search';
import { z } from 'zod';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  validateInput,
  ErrorCode
} from '@repo/api-utils';

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
  // Check authentication
  const { userId } = auth();
  if (!userId) {
    return createErrorResponse(
      new Error('Unauthorized'),
      { status: 401, errorCode: ErrorCode.UNAUTHORIZED }
    );
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return createErrorResponse(
      new Error(rateLimitResult.error?.message || 'Rate limit exceeded'),
      { 
        status: 429,
        headers: rateLimitResult.headers,
        errorCode: ErrorCode.RATE_LIMIT_EXCEEDED
      }
    );
  }

  try {
    // Initialize search service on first request
    if (!searchService) {
      const appId = process.env.ALGOLIA_APP_ID;
      const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
      const searchOnlyApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
      const indexName = process.env.ALGOLIA_INDEX_NAME;

      if (!appId || !apiKey || !searchOnlyApiKey || !indexName) {
        return createErrorResponse(
          new Error('Search service not configured'),
          { status: 503, errorCode: ErrorCode.SERVICE_UNAVAILABLE }
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
    const validationResult = validateInput(body, searchRequestSchema);
    if (!validationResult.success) {
      return createErrorResponse(
        new Error('Invalid search parameters'),
        { 
          status: 400, 
          errorCode: ErrorCode.VALIDATION_FAILED,
          details: validationResult.error.issues
        }
      );
    }
    const { filters, page, hitsPerPage } = validationResult.data;

    const result = await searchService.search(filters, page, hitsPerPage);

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  // Check authentication
  const { userId } = auth();
  if (!userId) {
    return createErrorResponse(
      new Error('Unauthorized'),
      { status: 401, errorCode: ErrorCode.UNAUTHORIZED }
    );
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  if (!rateLimitResult.allowed) {
    return createErrorResponse(
      new Error(rateLimitResult.error?.message || 'Rate limit exceeded'),
      { 
        status: 429,
        headers: rateLimitResult.headers,
        errorCode: ErrorCode.RATE_LIMIT_EXCEEDED
      }
    );
  }

  try {
    // Initialize search service on first request
    if (!searchService) {
      const appId = process.env.ALGOLIA_APP_ID;
      const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
      const searchOnlyApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
      const indexName = process.env.ALGOLIA_INDEX_NAME;

      if (!appId || !apiKey || !searchOnlyApiKey || !indexName) {
        return createErrorResponse(
          new Error('Search service not configured'),
          { status: 503, errorCode: ErrorCode.SERVICE_UNAVAILABLE }
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
    const sortBy = searchParams.get('sortBy') as 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed' | 'most_favorited' | null;

    interface SearchFilters {
      query: string;
      categories?: string[];
      brands?: string[];
      conditions?: string[];
      sortBy?: string;
    }

    const filters: SearchFilters = { query };
    
    if (category) filters.categories = [category];
    if (brand) filters.brands = [brand];
    if (condition) filters.conditions = [condition];
    if (sortBy) filters.sortBy = sortBy;

    const result = await searchService.search(filters, page);

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse(error);
  }
}