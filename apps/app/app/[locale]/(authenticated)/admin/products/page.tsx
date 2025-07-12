import { database } from '@repo/database';
import { AdminProductsClient } from './admin-products-client';
import type { ReactElement } from 'react';

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

// Server Component - handles data fetching
const AdminProductsPage = async ({ searchParams }: PageProps): Promise<ReactElement> => {
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

  const products = await database.product.findMany({
    where,
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
    take: 50
  });

  return <AdminProductsClient products={products} />;
};

export default AdminProductsPage;