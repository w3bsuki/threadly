import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { prisma } from '@repo/database'

export interface FetchOptions {
  cache?: RequestCache | { revalidate?: number | false; tags?: string[] }
  next?: { revalidate?: number | false; tags?: string[] }
}

// Deduplicate requests within a single request lifecycle
export const dedupe = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T => {
  return cache(fn) as T
}

// Cache data between requests
export const cacheData = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keys: string[],
  options?: {
    revalidate?: number | false
    tags?: string[]
  }
): T => {
  return unstable_cache(fn, keys, {
    revalidate: options?.revalidate ?? 3600, // 1 hour default
    tags: options?.tags,
  }) as T
}

// Parallel data fetching
export async function fetchInParallel<T extends Record<string, () => Promise<any>>>(
  fetchers: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(fetchers) as (keyof T)[]
  const promises = keys.map((key) => fetchers[key]())
  const results = await Promise.all(promises)
  
  return keys.reduce((acc, key, index) => {
    acc[key] = results[index]
    return acc
  }, {} as { [K in keyof T]: Awaited<ReturnType<T[K]>> })
}

// Optimized pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export async function fetchPaginated<T>(
  fetcher: (skip: number, take: number) => Promise<T[]>,
  counter: () => Promise<number>,
  page: number,
  pageSize: number
): Promise<PaginatedResponse<T>> {
  const skip = (page - 1) * pageSize
  
  const [items, total] = await Promise.all([
    fetcher(skip, pageSize),
    counter(),
  ])
  
  const totalPages = Math.ceil(total / pageSize)
  
  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

// Cursor-based pagination
export interface CursorPaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export async function fetchCursorPaginated<T extends { id: string }>(
  fetcher: (cursor?: string, limit?: number) => Promise<T[]>,
  cursor?: string,
  limit = 20
): Promise<CursorPaginatedResponse<T>> {
  // Fetch one extra item to determine if there's more
  const items = await fetcher(cursor, limit + 1)
  
  const hasMore = items.length > limit
  const resultItems = hasMore ? items.slice(0, -1) : items
  const nextCursor = hasMore ? resultItems[resultItems.length - 1]?.id : null
  
  return {
    items: resultItems,
    nextCursor,
    hasMore,
  }
}

// Optimistic updates helper
export function createOptimisticUpdate<T>(
  currentData: T[],
  action: 'add' | 'update' | 'delete',
  item: Partial<T> & { id: string }
): T[] {
  switch (action) {
    case 'add':
      return [item as T, ...currentData]
    
    case 'update':
      return currentData.map((data) =>
        (data as any).id === item.id ? { ...data, ...item } : data
      )
    
    case 'delete':
      return currentData.filter((data) => (data as any).id !== item.id)
    
    default:
      return currentData
  }
}

// Batch operations
export async function batchOperation<T, R>(
  items: T[],
  operation: (batch: T[]) => Promise<R[]>,
  batchSize = 50
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await operation(batch)
    results.push(...batchResults)
  }
  
  return results
}

// Streaming data helper
export async function* streamData<T>(
  fetcher: (cursor?: string) => Promise<{ items: T[]; nextCursor: string | null }>,
  initialCursor?: string
): AsyncGenerator<T[], void, unknown> {
  let cursor: string | null | undefined = initialCursor
  
  while (true) {
    const { items, nextCursor } = await fetcher(cursor)
    
    if (items.length === 0) break
    
    yield items
    
    if (!nextCursor) break
    cursor = nextCursor
  }
}

// Prefetch helper for Next.js
export function prefetchQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string[]
) {
  return {
    queryKey: cacheKey,
    queryFn: dedupe(queryFn),
  }
}

// Data loader pattern
export class DataLoader<K, V> {
  private batch: Array<{ key: K; resolve: (value: V) => void; reject: (error: any) => void }> = []
  private scheduled = false

  constructor(
    private batchFn: (keys: K[]) => Promise<V[]>,
    private options: { maxBatchSize?: number; batchWindow?: number } = {}
  ) {}

  async load(key: K): Promise<V> {
    return new Promise((resolve, reject) => {
      this.batch.push({ key, resolve, reject })
      
      if (!this.scheduled) {
        this.scheduled = true
        process.nextTick(() => this.flush())
      }
      
      if (this.batch.length >= (this.options.maxBatchSize || 100)) {
        this.flush()
      }
    })
  }

  private async flush() {
    const batch = this.batch
    this.batch = []
    this.scheduled = false
    
    if (batch.length === 0) return
    
    try {
      const keys = batch.map(({ key }) => key)
      const values = await this.batchFn(keys)
      
      batch.forEach(({ resolve }, index) => {
        resolve(values[index])
      })
    } catch (error) {
      batch.forEach(({ reject }) => {
        reject(error)
      })
    }
  }
}