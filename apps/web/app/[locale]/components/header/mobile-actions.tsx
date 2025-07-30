'use client';

import { useUser } from '@repo/auth/auth/client';
import { Button } from '@repo/ui/components';
import { User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { SafeUserButton } from './safe-user-button';

export const MobileActions = memo(() => {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';

  return (
    <div className="flex items-center gap-2">
      {isLoaded ? (
        isSignedIn ? (
          <>
            <Button
              asChild
              className="text-background hover:bg-background/10"
              size="sm"
              variant="ghost"
            >
              <Link href={`/${locale}/account`}>
                <User className="mr-1 h-5 w-5" />
                <span className="text-sm">Account</span>
              </Link>
            </Button>
            <SafeUserButton />
          </>
        ) : (
          <Button
            asChild
            className="bg-background text-foreground hover:bg-background/90"
            size="sm"
            variant="default"
          >
            <Link href={`/${locale}/sign-in`}>Sign In</Link>
          </Button>
        )
      ) : (
        <div className="h-8 w-8 animate-pulse rounded-full bg-accent" />
      )}
    </div>
  );
});

MobileActions.displayName = 'MobileActions';
