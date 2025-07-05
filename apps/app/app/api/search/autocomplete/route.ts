import { NextRequest, NextResponse } from 'next/server';
import { getSearchService } from '@repo/search';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

let searchService: any;

export async function GET(request: NextRequest) {
  try {
    // Initialize search service on first request
    if (!searchService) {
      if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const results = await searchService.getAutoComplete(query, limit);
    return NextResponse.json(results);
  } catch (error) {
    logError('[Search Autocomplete API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get autocomplete results' },
      { status: 500 }
    );
  }
}