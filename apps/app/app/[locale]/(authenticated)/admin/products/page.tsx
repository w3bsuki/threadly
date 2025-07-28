import type { ProductStatus } from '@repo/database';
import { database } from '@repo/database';
import {
  buildCursorWhere,
  processPaginationResult,
  validatePaginationParams,
} from '@repo/design-system/lib/pagination';
import type { ReactElement } from 'react';
import { AdminProductsClient } from './admin-products-client';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    cursor?: string;
    limit?: string;
  }>;
}

// Server Component - handles data fetching
const AdminProductsPage = async ({
  searchParams,
}: PageProps): Promise<React.JSX.Element> => {
  const params = await searchParams;
  const search = params.q || '';
  const statusFilter = params.status || 'all';

  // Build where clause
  const where: {
    OR?: Array<
      | { title?: { contains: string; mode: 'insensitive' } }
      | { description?: { contains: string; mode: 'insensitive' } }
    >;
    status?: ProductStatus;
  } = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (statusFilter !== 'all') {
    const upperStatus = statusFilter.toUpperCase() as ProductStatus;
    if (
      upperStatus === 'AVAILABLE' ||
      upperStatus === 'SOLD' ||
      upperStatus === 'RESERVED' ||
      upperStatus === 'REMOVED'
    ) {
      where.status = upperStatus;
    }
  }

  // Parse pagination parameters
  const searchParamsObj = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') {
      searchParamsObj.set(key, value);
    }
  });
  const pagination = validatePaginationParams(searchParamsObj);

  // Get total count for admin stats
  const totalCount = await database.product.count({ where });

  // Fetch products with pagination
  const products = await database.product.findMany({
    where: {
      ...where,
      ...buildCursorWhere(pagination.cursor),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      category: true,
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1,
      },
      _count: {
        select: {
          favorites: true,
          orders: true,
        },
      },
    },
    take: pagination.limit,
  });

  // Convert Decimal price to number for client component
  const formattedProducts = products.map((product) => ({
    ...product,
    price: Number(product.price),
  }));

  // Process pagination result
  const paginationResult = processPaginationResult(
    formattedProducts,
    pagination.limit,
    totalCount
  );

  return (
    <AdminProductsClient
      paginatedData={paginationResult}
      search={search}
      statusFilter={statusFilter}
    />
  );
};

export default AdminProductsPage;
