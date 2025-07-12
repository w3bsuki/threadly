import { database } from '@repo/database';
import { AdminProductsClient } from './admin-products-client';
import { validatePaginationParams, buildCursorWhere, processPaginationResult } from '@repo/design-system/lib/pagination';
import type { ReactElement } from 'react';

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; cursor?: string; limit?: string }>;
}

// Server Component - handles data fetching
const AdminProductsPage = async ({ searchParams }: PageProps): Promise<React.JSX.Element> => {
  const params = await searchParams;
  const search = params.q || '';
  const statusFilter = params.status || 'all';

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (statusFilter !== 'all') {
    where.status = statusFilter.toUpperCase();
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
          email: true
        }
      },
      category: true,
      images: {
        orderBy: { displayOrder: 'asc' },
        take: 1
      },
      _count: {
        select: {
          favorites: true,
          orders: true
        }
      }
    },
    take: pagination.limit
  });

  // Process pagination result
  const paginationResult = processPaginationResult(products, pagination.limit, totalCount);

  return <AdminProductsClient paginatedData={paginationResult} search={search} statusFilter={statusFilter} />;
};

export default AdminProductsPage;