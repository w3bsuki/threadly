'use client';

import { SignInButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { User } from 'lucide-react';
import { memo } from 'react';
import { SafeUserButton } from './safe-user-button';

export const MobileActions = memo(() => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center gap-1">
      {isSignedIn ? (
        <SafeUserButton />
      ) : (
        <SignInButton mode="modal">
          <Button
            className="-mr-2 h-9 w-9 text-white hover:bg-white/10"
            size="icon"
            variant="ghost"
          >
            <User className="h-5 w-5" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
});

MobileActions.displayName = 'MobileActions';