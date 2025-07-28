'use client';

import { UserButton as ClerkUserButton } from '@repo/auth/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { env } from '@/env';

export function EnhancedUserMenu() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-accent" />;
  }

  return (
    <div className="flex items-center gap-2">
      <ClerkUserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            userButtonBox: 'flex items-center gap-2',
          },
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground">
          Quick Links
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link className="cursor-pointer" href="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link className="cursor-pointer" href="/favorites">
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link className="cursor-pointer" href="/profile">
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              className="cursor-pointer"
              href={`${env.NEXT_PUBLIC_APP_URL}/selling/listings`}
            >
              <Package className="mr-2 h-4 w-4" />
              My Listings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              className="cursor-pointer"
              href={`${env.NEXT_PUBLIC_APP_URL}/dashboard`}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Seller Dashboard
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
