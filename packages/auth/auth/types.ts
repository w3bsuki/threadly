export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface UserRepository {
  findByClerkId(clerkId: string): Promise<{
    id: string;
    role: UserRole;
    clerkId: string;
  } | null>;
}

export interface AdminUser {
  role: UserRole;
}

// Type guard for admin checking
export function isAdminUser(
  user: { role: UserRole } | null
): user is AdminUser {
  return user?.role === 'ADMIN';
}

// Type guard for moderator checking
export function isModeratorUser(user: { role: UserRole } | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'MODERATOR';
}
