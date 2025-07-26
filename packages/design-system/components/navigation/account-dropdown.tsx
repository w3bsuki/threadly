'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, User, ShoppingBag, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';

interface AccountDropdownProps {
  isSignedIn?: boolean;
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  locale?: string;
  className?: string;
  onSignOut?: () => void;
  dictionary?: {
    profile?: string;
    orders?: string;
    settings?: string;
    signOut?: string;
    signIn?: string;
    createAccount?: string;
  };
}

export function AccountDropdown({
  isSignedIn = false,
  user,
  locale = 'en',
  className,
  onSignOut,
  dictionary = {
    profile: 'Profile',
    orders: 'Orders',
    settings: 'Settings',
    signOut: 'Sign Out',
    signIn: 'Sign In',
    createAccount: 'Create Account',
  },
}: AccountDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleNavigate = (path: string) => {
    router.push(`/${locale}${path}`);
    setOpen(false);
  };

  const handleSignOut = () => {
    onSignOut?.();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-10 w-10 transition-all duration-200',
            'hover:bg-accent/50 hover:scale-105',
            'focus-visible:scale-105',
            'data-[state=open]:bg-accent data-[state=open]:scale-105',
            className
          )}
          aria-label="Account menu"
        >
          <UserCircle className="h-5 w-5 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          'w-56 p-2',
          'bg-background/95 backdrop-blur-md',
          'border border-border/50',
          'shadow-lg shadow-black/5',
          'animate-in fade-in-0 zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'duration-150'
        )}
      >
        {isSignedIn ? (
          <>
            {user && (user.name || user.email) && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {user.name && (
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                    )}
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
              </>
            )}
            <DropdownMenuItem
              onClick={() => handleNavigate('/profile')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.profile}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigate('/orders')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.orders}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigate('/settings')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.settings}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'transition-all duration-150',
                'hover:bg-destructive/10',
                'focus:bg-destructive/10',
                'text-destructive',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
            >
              <LogOut className="h-4 w-4" />
              <span className="flex-1">{dictionary.signOut}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => handleNavigate('/sign-in')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
            >
              <LogIn className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.signIn}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleNavigate('/sign-up')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
            >
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.createAccount}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Mobile optimized variant with larger touch targets
export function MobileAccountDropdown(props: AccountDropdownProps) {
  return (
    <AccountDropdown
      {...props}
      className={cn(
        'h-12 w-12 touch-target-lg',
        '@container/account',
        props.className
      )}
    />
  );
}