'use client';

import { SignInButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { Heart, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { env } from '@/env';
import { CartDropdown } from './cart-dropdown';
import { SafeUserButton } from './safe-user-button';
import { SignInCTA } from '@/components/sign-in-cta';
import { EnhancedUserMenu } from './enhanced-user-menu';

export const ActionButtons = memo(() => {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

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
        <EnhancedUserMenu />
      ) : (
        <Button asChild className="flex items-center" variant="ghost">
          <Link href={`/${locale}/sign-in`}>
            <User className="mr-2 h-5 w-5" />
            <span>Sign In</span>
          </Link>
        </Button>
      )}

      {isSignedIn ? (
        <Button
          asChild
          className="bg-foreground text-background hover:bg-secondary-foreground"
          variant="default"
        >
          <Link href={`/${locale}/selling/new`}>
            <Plus className="mr-2 h-5 w-5" />
            Sell
          </Link>
        </Button>
      ) : (
        <SignInCTA
          className="bg-foreground text-background hover:bg-secondary-foreground"
          redirectPath="/selling/new"
          variant="default"
        >
          <Plus className="mr-2 h-5 w-5" />
          Sell
        </SignInCTA>
      )}
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';