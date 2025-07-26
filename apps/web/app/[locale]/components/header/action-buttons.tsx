'use client';

import { SignInButton, useUser, useClerk } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { AccountDropdown } from '@repo/design-system/components/navigation';
import { Heart, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { env } from '@/env';
import { CartDropdown } from './cart-dropdown';
import { SafeUserButton } from './safe-user-button';
import { SignInCTA } from '@/components/sign-in-cta';
import { EnhancedUserMenu } from './enhanced-user-menu';
import { useI18n } from '../providers/i18n-provider';

export const ActionButtons = memo(() => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const { dictionary } = useI18n();

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}`);
  };

  return (
    <div className="flex items-center space-x-3">
      <Button asChild size="sm" variant="ghost">
        <Link className="flex items-center" href="/favorites">
          <Heart className="mr-2 h-5 w-5" />
          <span>Saved</span>
        </Link>
      </Button>

      <CartDropdown />

      <AccountDropdown
        isSignedIn={isSignedIn}
        user={user ? {
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || undefined,
          email: user.emailAddresses?.[0]?.emailAddress,
        } : undefined}
        locale={locale}
        dictionary={{
          profile: dictionary?.web?.global?.navigation?.profile || 'Profile',
          orders: dictionary?.web?.global?.navigation?.orders || 'Orders',
          settings: dictionary?.web?.global?.navigation?.settings || 'Settings',
          signOut: dictionary?.web?.global?.navigation?.signOut || 'Sign Out',
          signIn: dictionary?.web?.global?.navigation?.signIn || 'Sign In',
          createAccount: dictionary?.web?.global?.navigation?.createAccount || 'Create Account',
        }}
        onSignOut={handleSignOut}
      />

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