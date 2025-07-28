import type { Prisma } from '../../generated/client';

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const getPaginationParams = (params: PaginationParams) => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationResult = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginationResult<T> => {
  const { page, limit } = getPaginationParams(params);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const createCursorPaginationResult = <T extends { id: string }>(
  data: T[],
  limit: number
): CursorPaginationResult<T> => {
  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? items[items.length - 1]?.id || null : null;

  return {
    data: items,
    nextCursor,
    hasMore,
  };
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, delay = 1000, shouldRetry = () => true } = options;
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || i === maxRetries - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw lastError;
};

export const batchProcess = async <T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize = 100
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }

  return results;
};

export const createSearchConditions = (
  searchTerm: string,
  fields: string[]
): Prisma.StringFilter[] => {
  if (!searchTerm) return [];

  const normalizedSearch = searchTerm.trim().toLowerCase();

  return fields.map((field) => ({
    contains: normalizedSearch,
    mode: 'insensitive' as const,
  }));
};

export const createDateRangeFilter = (
  startDate?: Date | string,
  endDate?: Date | string
): Prisma.DateTimeFilter | undefined => {
  if (!(startDate || endDate)) return;

  const filter: Prisma.DateTimeFilter = {};

  if (startDate) {
    filter.gte = new Date(startDate);
  }

  if (endDate) {
    filter.lte = new Date(endDate);
  }

  return filter;
};

export const createPriceRangeFilter = (
  minPrice?: number,
  maxPrice?: number
): Prisma.DecimalFilter | undefined => {
  if (minPrice === undefined && maxPrice === undefined) return;

  const filter: Prisma.DecimalFilter = {};

  if (minPrice !== undefined) {
    filter.gte = minPrice;
  }

  if (maxPrice !== undefined) {
    filter.lte = maxPrice;
  }

  return filter;
};

// TODO: Fix TypeScript generics issue
// export const excludeSoftDeleted = <T extends { deletedAt?: Date | null }>(
//   where: Prisma.Args<T, 'findMany'>['where'] = {}
// ): Prisma.Args<T, 'findMany'>['where'] => {
//   return {
//     ...where,
//     deletedAt: null,
//   }
// }

export const softDelete = async <T extends { id: string }>(
  model: any,
  id: string
): Promise<T> => {
  return model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const createAuditLog = async (
  prisma: any,
  data: {
    userId?: string;
    eventType: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
    severity?: string;
    ipAddress?: string;
    userAgent?: string;
  }
) => {
  return prisma.auditLog.create({
    data: {
      ...data,
      metadata: data.metadata || {},
      severity: data.severity || 'low',
    },
  });
};

export const optimizeIncludes = <T>(
  includes: T,
  requestedFields?: string[]
): T => {
  if (!requestedFields || requestedFields.length === 0) {
    return includes;
  }

  const optimized: any = {};

  for (const field of requestedFields) {
    if (includes && typeof includes === 'object' && field in includes) {
      optimized[field] = (includes as any)[field];
    }
  }

  return optimized as T;
};

export class QueryBuilder<T> {
  private whereConditions: any = {};
  private orderByConditions: any[] = [];
  private includeRelations: any = {};
  private selectFields: any = undefined;
  private skipCount = 0;
  private takeCount = 20;

  where(conditions: any): this {
    this.whereConditions = { ...this.whereConditions, ...conditions };
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByConditions.push({ [field]: direction });
    return this;
  }

  include(relations: any): this {
    this.includeRelations = { ...this.includeRelations, ...relations };
    return this;
  }

  select(fields: any): this {
    this.selectFields = fields;
    return this;
  }

  skip(count: number): this {
    this.skipCount = count;
    return this;
  }

  take(count: number): this {
    this.takeCount = count;
    return this;
  }

  paginate(page: number, limit: number): this {
    const { skip } = getPaginationParams({ page, limit });
    this.skipCount = skip;
    this.takeCount = limit;
    return this;
  }

  build(): any {
    const query: any = {
      where: this.whereConditions,
      skip: this.skipCount,
      take: this.takeCount,
    };

    if (this.orderByConditions.length > 0) {
      query.orderBy = this.orderByConditions;
    }

    if (Object.keys(this.includeRelations).length > 0) {
      query.include = this.includeRelations;
    }

    if (this.selectFields) {
      query.select = this.selectFields;
    }

    return query;
  }
}
