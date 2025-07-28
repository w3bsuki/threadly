'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import {
  Eye,
  Mail,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  suspendUser,
  unsuspendUser,
  updateUserRole,
  verifyUser,
} from './actions';

interface UserActionsProps {
  user: {
    id: string;
    clerkId: string;
    email: string;
    role: string;
    verified: boolean;
    suspended?: boolean;
  };
}

export function UserActions({ user }: UserActionsProps): React.JSX.Element {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
      router.refresh();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading} size="icon" variant="ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/profile/${user.clerkId}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href={`mailto:${user.email}`}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Role Management */}
        {user.role !== 'ADMIN' && (
          <DropdownMenuItem
            onClick={() => handleAction(() => updateUserRole(user.id, 'ADMIN'))}
          >
            <Shield className="mr-2 h-4 w-4" />
            Make Admin
          </DropdownMenuItem>
        )}

        {user.role !== 'MODERATOR' && (
          <DropdownMenuItem
            onClick={() =>
              handleAction(() => updateUserRole(user.id, 'MODERATOR'))
            }
          >
            <Shield className="mr-2 h-4 w-4" />
            Make Moderator
          </DropdownMenuItem>
        )}

        {user.role !== 'USER' && (
          <DropdownMenuItem
            onClick={() => handleAction(() => updateUserRole(user.id, 'USER'))}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Make Regular User
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Verification */}
        {!user.verified && (
          <DropdownMenuItem
            onClick={() => handleAction(() => verifyUser(user.id))}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Verify User
          </DropdownMenuItem>
        )}

        {/* Suspension */}
        {user.suspended ? (
          <DropdownMenuItem
            onClick={() => {
              if (confirm('Are you sure you want to unsuspend this user?')) {
                handleAction(() => unsuspendUser(user.id));
              }
            }}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Unsuspend User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              if (confirm('Are you sure you want to suspend this user?')) {
                handleAction(() => suspendUser(user.id));
              }
            }}
          >
            <UserX className="mr-2 h-4 w-4" />
            Suspend User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
