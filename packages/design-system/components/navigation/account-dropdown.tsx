'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { cn } from '@repo/design-system/lib/utils';
import {
  LogIn,
  LogOut,
  Settings,
  ShoppingBag,
  User,
  UserCircle,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

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
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Account menu"
          className={cn(
            'relative h-10 w-10 transition-all duration-200',
            'hover:scale-105 hover:bg-accent/50',
            'focus-visible:scale-105',
            'data-[state=open]:scale-105 data-[state=open]:bg-accent',
            className
          )}
          size="icon"
          variant="ghost"
        >
          <UserCircle className="h-5 w-5 transition-transform duration-200" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-56 p-2',
          'bg-background/95 backdrop-blur-md',
          'border border-border/50',
          'shadow-black/5 shadow-lg',
          'fade-in-0 zoom-in-95 animate-in',
          'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:animate-out',
          'duration-150'
        )}
        sideOffset={8}
      >
        {isSignedIn ? (
          <>
            {user && (user.name || user.email) && (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {user.name && (
                      <p className="font-medium text-sm leading-none">
                        {user.name}
                      </p>
                    )}
                    {user.email && (
                      <p className="text-muted-foreground text-xs leading-none">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-2" />
              </>
            )}
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
              onClick={() => handleNavigate('/profile')}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.profile}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
              onClick={() => handleNavigate('/orders')}
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.orders}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
              onClick={() => handleNavigate('/settings')}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.settings}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                'transition-all duration-150',
                'hover:bg-destructive/10',
                'focus:bg-destructive/10',
                'text-destructive',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="flex-1">{dictionary.signOut}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
              onClick={() => handleNavigate('/sign-in')}
            >
              <LogIn className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{dictionary.signIn}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5',
                'transition-all duration-150',
                'hover:bg-accent/50',
                'focus:bg-accent/50',
                'active:scale-[0.98]',
                'rounded-[var(--radius-sm)]'
              )}
              onClick={() => handleNavigate('/sign-up')}
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
        'touch-target-lg h-12 w-12',
        '@container/account',
        props.className
      )}
    />
  );
}
