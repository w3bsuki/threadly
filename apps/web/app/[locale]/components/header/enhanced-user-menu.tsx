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
  Heart, 
  ShoppingBag, 
  Package, 
  LayoutDashboard,
  Settings,
  ChevronDown
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
            userButtonBox: 'flex items-center gap-2'
          }
        }}
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Quick Links
          <ChevronDown className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href="/orders" className="cursor-pointer">
              <ShoppingBag className="mr-2 h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/favorites" className="cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href={`${env.NEXT_PUBLIC_APP_URL}/selling/listings`} className="cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              My Listings
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={`${env.NEXT_PUBLIC_APP_URL}/dashboard`} className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Seller Dashboard
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}