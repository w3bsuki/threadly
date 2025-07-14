import { database } from '@repo/database';
import AdminUsersClient from './admin-users-client';
import { validatePaginationParams, buildCursorWhere, processPaginationResult } from '@repo/design-system/lib/pagination';

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; cursor?: string; limit?: string }>;
}

const AdminUsersPage: React.FC<PageProps> = async ({ searchParams }) => {
  const params = await searchParams;
  const search = params.q || '';
  const roleFilter = params.role || 'all';

  // Build where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } }
    ];
  }
  
  if (roleFilter !== 'all') {
    where.role = roleFilter.toUpperCase();
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
  const totalCount = await database.user.count({ where });

  // Fetch users with pagination (using joinedAt for cursor)
  const users = await database.user.findMany({
    where: {
      ...where,
      // Custom cursor for joinedAt field
      ...(pagination.cursor ? {
        OR: [
          {
            joinedAt: {
              lt: new Date(Buffer.from(pagination.cursor, 'base64').toString('utf-8').split(':')[0]),
            },
          },
          {
            joinedAt: new Date(Buffer.from(pagination.cursor, 'base64').toString('utf-8').split(':')[0]),
            id: {
              lt: Buffer.from(pagination.cursor, 'base64').toString('utf-8').split(':')[1],
            },
          },
        ],
      } : {}),
    },
    orderBy: { joinedAt: 'desc' },
    select: {
      id: true,
      clerkId: true,
      email: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
      role: true,
      verified: true,
      suspended: true,
      joinedAt: true,
      _count: {
        select: {
          Product: true,
          Order_Order_buyerIdToUser: true,
          Order_Order_sellerIdToUser: true
        }
      }
    },
    take: pagination.limit
  });

  // Process pagination result (create compatible data for cursor generation)
  const usersWithCreatedAt = users.map(user => ({
    ...user,
    createdAt: user.joinedAt, // Map joinedAt to createdAt for cursor compatibility
  }));
  const paginationResult = processPaginationResult(usersWithCreatedAt, pagination.limit, totalCount);

  return (
    <AdminUsersClient 
      paginatedData={{
        ...paginationResult,
        items: paginationResult.items.map(({ createdAt, ...user }) => user), // Remove createdAt before passing to client
      }}
      search={search}
      roleFilter={roleFilter}
    />
  );
};

export default AdminUsersPage;