import { createAdminClient } from '@repo/auth/admin-client';
import { database } from '@repo/database';

// Create admin client with database repository
export const adminClient = createAdminClient({
  findByClerkId: async (clerkId: string) => {
    const user = await database.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true, clerkId: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      role: user.role as 'USER' | 'MODERATOR' | 'ADMIN',
      clerkId: user.clerkId,
    };
  },
});

// Export convenience functions
export const { requireAdmin, isAdmin, canModerate } = adminClient;
