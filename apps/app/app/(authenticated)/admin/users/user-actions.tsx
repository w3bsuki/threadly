'use client';

import { 
  MoreVertical, 
  Shield,
  UserX,
  Mail,
  Eye,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { updateUserRole, suspendUser, unsuspendUser, verifyUser } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: () => Promise<any>) => {
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
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/profile/${user.clerkId}`} target="_blank">
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <a href={`mailto:${user.email}`}>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </a>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Role Management */}
        {user.role !== 'ADMIN' && (
          <DropdownMenuItem
            onClick={() => handleAction(() => updateUserRole(user.id, 'ADMIN'))}
          >
            <Shield className="h-4 w-4 mr-2" />
            Make Admin
          </DropdownMenuItem>
        )}
        
        {user.role !== 'MODERATOR' && (
          <DropdownMenuItem
            onClick={() => handleAction(() => updateUserRole(user.id, 'MODERATOR'))}
          >
            <Shield className="h-4 w-4 mr-2" />
            Make Moderator
          </DropdownMenuItem>
        )}
        
        {user.role !== 'USER' && (
          <DropdownMenuItem
            onClick={() => handleAction(() => updateUserRole(user.id, 'USER'))}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Make Regular User
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Verification */}
        {!user.verified && (
          <DropdownMenuItem
            onClick={() => handleAction(() => verifyUser(user.id))}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Verify User
          </DropdownMenuItem>
        )}
        
        {/* Suspension */}
        {!user.suspended ? (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              if (confirm('Are you sure you want to suspend this user?')) {
                handleAction(() => suspendUser(user.id));
              }
            }}
          >
            <UserX className="h-4 w-4 mr-2" />
            Suspend User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              if (confirm('Are you sure you want to unsuspend this user?')) {
                handleAction(() => unsuspendUser(user.id));
              }
            }}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Unsuspend User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}