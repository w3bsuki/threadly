/**
 * Example API Routes for Search Package
 * Copy these into your app's API routes for consistent search functionality
 */

// app/api/search/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSearchHandler } from '@repo/search';

const searchHandler = createSearchHandler({
  useAlgolia: true,
  useDatabaseFallback: true,
  cacheResults: true,
  trackHistory: true,
});

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  return searchHandler.search(request, userId || undefined);
}

// app/api/search/suggestions/route.ts
export async function GET(request: NextRequest) {
  return searchHandler.suggestions(request);
}

// app/api/search/popular/route.ts
export async function GET(request: NextRequest) {
  return searchHandler.popular(request);
}

// app/api/search-history/route.ts
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  return searchHandler.history(request, userId);
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  return searchHandler.history(request, userId);
}

// app/api/saved-searches/route.ts
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  return searchHandler.savedSearches(request, userId);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  return searchHandler.savedSearches(request, userId);
}

// app/api/saved-searches/[id]/route.ts
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id } = await params;
  return searchHandler.savedSearch(request, userId, id);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id } = await params;
  return searchHandler.savedSearch(request, userId, id);
}

// app/api/saved-searches/[id]/toggle-alerts/route.ts
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id } = await params;
  return searchHandler.toggleAlerts(request, userId, id);
}