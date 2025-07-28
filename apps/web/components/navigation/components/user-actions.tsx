import { SignInButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { Heart, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartDropdown } from '../../../app/[locale]/components/header/cart-dropdown';
import { EnhancedUserMenu } from '../../../app/[locale]/components/header/enhanced-user-menu';
import { SafeUserButton } from '../../../app/[locale]/components/header/safe-user-button';
import { env } from '../../../env';
import { SignInCTA } from '../../sign-in-cta';

interface UserActionsProps {
  variant: 'desktop' | 'mobile';
  locale: string;
  onClose?: () => void;
}

export function UserActions({ variant, locale, onClose }: UserActionsProps) {
  const { isSignedIn, user } = useUser();

  if (variant === 'desktop') {
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
          <Button asChild variant="default">
            <Link href={`/${locale}/selling/new`}>
              <Plus className="mr-2 h-5 w-5" />
              Sell
            </Link>
          </Button>
        ) : (
          <SignInCTA redirectPath="/selling/new" variant="default">
            <Plus className="mr-2 h-5 w-5" />
            Sell
          </SignInCTA>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isSignedIn ? (
        <SafeUserButton />
      ) : (
        <Button asChild className="-mr-2 h-9 w-9" size="icon" variant="ghost">
          <Link href={`/${locale}/sign-in`}>
            <User className="h-5 w-5" />
          </Link>
        </Button>
      )}
    </div>
  );
}
