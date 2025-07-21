import { z } from 'zod';

// Pagination schema for validating search params
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Cursor pagination result type
export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor?: string;
  hasNextPage: boolean;
  totalCount?: number;
}

// Generate cursor from item (usually createdAt + id for uniqueness)
export function generateCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}:${id}`).toString('base64');
}

// Parse cursor back to createdAt and id
export function parseCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [createdAtStr, id] = decoded.split(':');
    return {
      createdAt: new Date(createdAtStr),
      id,
    };
  } catch {
    return null;
  }
}

// Helper for building Prisma where clauses for cursor pagination
export function buildCursorWhere(cursor?: string) {
  if (!cursor) return {};
  
  const parsed = parseCursor(cursor);
  if (!parsed) return {};
  
  return {
    OR: [
      {
        createdAt: {
          lt: parsed.createdAt,
        },
      },
      {
        createdAt: parsed.createdAt,
        id: {
          lt: parsed.id,
        },
      },
    ],
  };
}

// Process pagination result and generate next cursor
export function processPaginationResult<T extends { createdAt: Date; id: string }>(
  items: T[],
  limit: number,
  totalCount?: number
): CursorPaginationResult<T> {
  const hasNextPage = items.length === limit;
  const nextCursor = hasNextPage && items.length > 0 
    ? generateCursor(items[items.length - 1].createdAt, items[items.length - 1].id)
    : undefined;

  return {
    items,
    nextCursor,
    hasNextPage,
    totalCount,
  };
}

// Validate pagination params from URL search params
export function validatePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const params = {
    cursor: searchParams.get('cursor') || undefined,
    limit: searchParams.get('limit') || undefined,
  };
  
  return paginationSchema.parse(params);
}

// Generate pagination URLs for navigation
export function generatePaginationUrl(
  baseUrl: string,
  cursor?: string,
  limit?: number,
  additionalParams?: Record<string, string>
): string {
  const url = new URL(baseUrl, 'http://localhost'); // Base needed for relative URLs
  
  if (cursor) url.searchParams.set('cursor', cursor);
  if (limit) url.searchParams.set('limit', limit.toString());
  
  Object.entries(additionalParams || {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  
  return url.pathname + url.search;
}