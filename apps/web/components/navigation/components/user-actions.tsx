import { SignInButton, useUser } from '@repo/auth/client';
import { Button } from '@repo/design-system/components';
import { Heart, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { CartDropdown } from '../../../app/[locale]/components/header/cart-dropdown';
import { SafeUserButton } from '../../../app/[locale]/components/header/safe-user-button';
import { env } from '../../../env';

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
  }

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
}
