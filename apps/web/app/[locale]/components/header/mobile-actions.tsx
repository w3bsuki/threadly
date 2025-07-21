'use client';

import { useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { User } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { SafeUserButton } from './safe-user-button';

export const MobileActions = memo(() => {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <div className="flex items-center gap-2">
      {!isLoaded ? (
        <div className="h-8 w-8 animate-pulse rounded-full bg-accent" />
      ) : isSignedIn ? (
        <>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-background hover:bg-background/10"
          >
            <Link href={`/${locale}/account`}>
              <User className="h-5 w-5 mr-1" />
              <span className="text-sm">Account</span>
            </Link>
          </Button>
          <SafeUserButton />
        </>
      ) : (
        <Button
          asChild
          size="sm"
          variant="default"
          className="bg-background text-foreground hover:bg-background/90"
        >
          <Link href={`/${locale}/sign-in`}>
            Sign In
          </Link>
        </Button>
      )}
    </div>
  );
});

MobileActions.displayName = 'MobileActions';