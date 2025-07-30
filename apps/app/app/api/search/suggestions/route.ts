import { log, logError } from '@repo/tooling/observability/server';
import { getSearchService } from '@repo/api/utils/search';
import { type NextRequest, NextResponse } from 'next/server';

let searchService: ReturnType<typeof getSearchService> | null = null;

export async function GET(request: NextRequest) {
  try {
    // Initialize search service on first request
    if (!searchService) {
      const appId = process.env.ALGOLIA_APP_ID;
      const apiKey = process.env.ALGOLIA_ADMIN_API_KEY;
      const searchOnlyApiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
      const indexName = process.env.ALGOLIA_INDEX_NAME;

      if (!(appId && apiKey && searchOnlyApiKey && indexName)) {
        logError(
          '[Search Suggestions API] Missing required environment variables',
          new Error('Missing Algolia environment variables')
        );
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
    const query = searchParams.get('q');
    const limit = Number.parseInt(searchParams.get('limit') || '5');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await searchService.getSearchSuggestions(query, limit);
    return NextResponse.json(suggestions);
  } catch (error) {
    logError('[Search Suggestions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
