'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  LazyAvatar,
} from '@repo/ui/components';
import {
  CursorPagination,
  useCursorPagination,
} from '@repo/ui/components/marketplace';
import type { CursorPaginationResult } from '@repo/ui/lib/pagination';
import {
  Eye,
  Mail,
  MoreVertical,
  Search,
  Shield,
  UserCheck,
  UserMinus,
  Users,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { bulkUpdateUsers } from './actions';
import { UserActions } from './user-actions';

interface UserWithDetails {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: string;
  verified: boolean;
  suspended: boolean;
  joinedAt: Date;
  _count: {
    Product: number;
    Order_Order_buyerIdToUser: number;
    Order_Order_sellerIdToUser: number;
  };
}

interface RoleStats {
  total: number;
  admins: number;
  moderators: number;
  users: number;
}

interface AdminUsersClientProps {
  paginatedData: CursorPaginationResult<UserWithDetails>;
  search: string;
  roleFilter: string;
}

function UserTable({ users }: { users: UserWithDetails[] }) {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleBulkAction = async (
    action: 'suspend' | 'unsuspend' | 'verify'
  ) => {
    if (selectedUsers.length === 0) return;

    setIsUpdating(true);
    try {
      await bulkUpdateUsers({
        userIds: selectedUsers,
        action,
      });
      setSelectedUsers([]);
      // Refresh the page using router
      router.refresh();
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-muted/50 p-4">
          <span className="font-medium text-sm">
            {selectedUsers.length} users selected
          </span>
          <div className="flex gap-2">
            <Button
              disabled={isUpdating}
              onClick={() => handleBulkAction('suspend')}
              size="sm"
              variant="destructive"
            >
              <UserMinus className="mr-1 h-4 w-4" />
              Suspend
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => handleBulkAction('unsuspend')}
              size="sm"
              variant="outline"
            >
              <UserCheck className="mr-1 h-4 w-4" />
              Unsuspend
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => handleBulkAction('verify')}
              size="sm"
              variant="outline"
            >
              <Shield className="mr-1 h-4 w-4" />
              Verify
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-12 p-2 text-left font-medium">
                <Checkbox
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-2 text-left font-medium">User</th>
              <th className="p-2 text-left font-medium">Role</th>
              <th className="p-2 text-left font-medium">Stats</th>
              <th className="p-2 text-left font-medium">Joined</th>
              <th className="p-2 text-left font-medium">Status</th>
              <th className="p-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-b hover:bg-muted/50" key={user.id}>
                <td className="p-2">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectUser(user.id, checked as boolean)
                    }
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <LazyAvatar
                      alt={`${user.firstName || ''} ${user.lastName || ''}`}
                      fallbackInitials={`${user.firstName?.[0] || user.email[0] || ''}${user.lastName?.[0] || ''}`}
                      size="md"
                      src={user.imageUrl}
                    />
                    <div>
                      <p className="font-medium">
                        {user.firstName || ''} {user.lastName || ''}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <Badge
                    variant={
                      user.role === 'ADMIN'
                        ? 'destructive'
                        : user.role === 'MODERATOR'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="p-2">
                  <div className="text-sm">
                    <p>{user._count.Product} listings</p>
                    <p className="text-muted-foreground">
                      {user._count.Order_Order_sellerIdToUser} sales •{' '}
                      {user._count.Order_Order_buyerIdToUser} purchases
                    </p>
                  </div>
                </td>
                <td className="p-2">
                  <p className="text-sm">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {user.suspended && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                    <Badge variant={user.verified ? 'default' : 'outline'}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminUsersClient({
  paginatedData,
  search,
  roleFilter,
}: AdminUsersClientProps): React.JSX.Element {
  const [users, setUsers] = useState(paginatedData.items);
  const { state, updateState } = useCursorPagination({
    cursor: paginatedData.nextCursor,
    hasNextPage: paginatedData.hasNextPage,
    totalCount: paginatedData.totalCount,
    isLoading: false,
  });

  const loadMore = useCallback(async () => {
    if (!state.hasNextPage || state.isLoading) return;

    updateState({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (state.cursor) params.set('cursor', state.cursor);
      params.set('limit', '20');
      if (search) params.set('q', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      setUsers((prev) => [...prev, ...data.items]);
      updateState({
        cursor: data.nextCursor,
        hasNextPage: data.hasNextPage,
        isLoading: false,
      });
    } catch (error) {
      updateState({ isLoading: false });
    }
  }, [
    state.cursor,
    state.hasNextPage,
    state.isLoading,
    search,
    roleFilter,
    updateState,
  ]);

  // Calculate stats from current page users only (admin needs total stats in future)
  const roleStats: RoleStats = {
    total: paginatedData.totalCount || users.length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    moderators: users.filter((u) => u.role === 'MODERATOR').length,
    users: users.filter((u) => u.role === 'USER').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl">User Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{roleStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{roleStats.admins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{roleStats.moderators}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{roleStats.users}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <form className="relative">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                <Input
                  className="w-[300px] pl-10"
                  defaultValue={search}
                  name="q"
                  placeholder="Search users..."
                />
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Role: {roleFilter === 'all' ? 'All' : roleFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=all">All Roles</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=admin">Admins</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=moderator">Moderators</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users?role=user">Users</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserTable users={users} />
        </CardContent>
      </Card>

      <CursorPagination
        currentCount={users.length}
        loadMoreText="Load More Users"
        onLoadMore={loadMore}
        showStats={true}
        state={state}
      />
    </div>
  );
}
