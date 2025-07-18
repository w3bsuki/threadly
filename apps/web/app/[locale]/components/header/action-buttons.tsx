'use client';

import { SignInButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { Heart, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { env } from '@/env';
import { CartDropdown } from './cart-dropdown';
import { SafeUserButton } from './safe-user-button';

export const ActionButtons = memo(() => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center space-x-3">
      <Button asChild size="sm" variant="ghost">
        <Link className="flex items-center" href="/favorites">
          <Heart className="mr-2 h-5 w-5" />
          <span>Saved</span>
        </Link>
      </Button>

      <CartDropdown />

      {isSignedIn ? (
        <SafeUserButton />
      ) : (
        <SignInButton mode="modal">
          <Button className="flex items-center" variant="ghost">
            <User className="mr-2 h-5 w-5" />
            <span>Sign In</span>
          </Button>
        </SignInButton>
      )}

      <Button
        asChild
        className="bg-black text-white hover:bg-gray-800"
        variant="default"
      >
        <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/new`}>
          <Plus className="mr-2 h-5 w-5" />
          Sell
        </Link>
      </Button>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';