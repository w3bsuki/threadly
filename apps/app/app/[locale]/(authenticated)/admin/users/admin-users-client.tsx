'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Checkbox } from '@repo/design-system/components';
import { LazyAvatar } from '@repo/design-system/components';
import { 
  MoreVertical, 
  Search,
  Shield,
  UserX,
  Mail,
  Eye,
  UserMinus,
  UserCheck,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import Link from 'next/link';
import { UserActions } from './user-actions';
import { bulkUpdateUsers } from './actions';

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
    listings: number;
    purchases: number;
    sales: number;
  };
}

interface RoleStats {
  total: number;
  admins: number;
  moderators: number;
  users: number;
}

interface AdminUsersClientProps {
  users: UserWithDetails[];
  search: string;
  roleFilter: string;
}

function UserTable({ users }: { users: UserWithDetails[] }) {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'unsuspend' | 'verify') => {
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
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedUsers.length} users selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('suspend')}
              disabled={isUpdating}
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Suspend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('unsuspend')}
              disabled={isUpdating}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Unsuspend
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('verify')}
              disabled={isUpdating}
            >
              <Shield className="h-4 w-4 mr-1" />
              Verify
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-2 font-medium">User</th>
              <th className="text-left p-2 font-medium">Role</th>
              <th className="text-left p-2 font-medium">Stats</th>
              <th className="text-left p-2 font-medium">Joined</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-right p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/50">
                <td className="p-2">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    <LazyAvatar
                      src={user.imageUrl}
                      alt={`${user.firstName || ''} ${user.lastName || ''}`}
                      size="md"
                      fallbackInitials={`${user.firstName?.[0] || user.email[0] || ''}${user.lastName?.[0] || ''}`}
                    />
                    <div>
                      <p className="font-medium">
                        {user.firstName || ''} {user.lastName || ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <Badge variant={
                    user.role === 'ADMIN' ? 'destructive' : 
                    user.role === 'MODERATOR' ? 'default' : 
                    'secondary'
                  }>
                    {user.role}
                  </Badge>
                </td>
                <td className="p-2">
                  <div className="text-sm">
                    <p>{user._count.listings} listings</p>
                    <p className="text-muted-foreground">
                      {user._count.sales} sales • {user._count.purchases} purchases
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
                      <Badge variant="destructive">
                        Suspended
                      </Badge>
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

export default function AdminUsersClient({ users, search, roleFilter }: AdminUsersClientProps) {
  // Calculate stats from the passed users data
  const roleStats: RoleStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    moderators: users.filter(u => u.role === 'MODERATOR').length,
    users: users.filter(u => u.role === 'USER').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.moderators}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleStats.users}</div>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  name="q"
                  defaultValue={search}
                  className="pl-10 w-[300px]"
                />
              </form>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
    </div>
  );
}