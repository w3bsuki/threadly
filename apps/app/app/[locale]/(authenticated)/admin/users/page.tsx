import { database } from '@repo/database';
import AdminUsersClient from './admin-users-client';

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string }>;
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

  const users = await database.user.findMany({
    where,
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
          listings: true,
          purchases: true,
          sales: true
        }
      }
    },
    take: 50
  });

  return (
    <AdminUsersClient 
      users={users}
      search={search}
      roleFilter={roleFilter}
    />
  );
};

export default AdminUsersPage;