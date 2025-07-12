'use client';

import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { 
  Home, 
  Search, 
  MessageCircle, 
  ShoppingBag,
  User,
  Plus,
  Heart
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@repo/commerce';
import { useState, useEffect } from 'react';

interface MobileBottomNavProps {
  className?: string;
  unreadMessages?: number;
}

export function MobileBottomNav({ className, unreadMessages = 0 }: MobileBottomNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const [cartItems, setCartItems] = useState(0);

  // Update cart items when store changes
  useEffect(() => {
    setCartItems(getTotalItems());
  }, [getTotalItems]);

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      badge: null,
    },
    {
      href: '/browse',
      icon: Search,
      label: 'Browse',
      badge: null,
    },
    {
      href: '/selling/new',
      icon: Plus,
      label: 'Sell',
      badge: null,
      isSpecial: true, // Different styling for primary action
    },
    {
      href: '/messages',
      icon: MessageCircle,
      label: 'Messages',
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
      badge: null,
    },
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <div 
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 md:hidden',
          'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'border-t border-border',
          'safe-area-padding-bottom', // Handle device safe areas
          className
        )}
      >
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'relative flex flex-col items-center justify-center',
                    'h-16 w-full gap-1 rounded-lg',
                    'min-h-[44px] min-w-[44px]', // Ensure minimum touch target
                    'text-xs font-medium',
                    'hover:bg-accent/50 active:bg-accent',
                    'transition-colors duration-200',
                    item.isSpecial && [
                      'bg-primary text-primary-foreground',
                      'hover:bg-primary/90 active:bg-primary/80',
                      'shadow-lg shadow-primary/20'
                    ],
                    isActive && !item.isSpecial && [
                      'text-primary bg-primary/10',
                      'hover:bg-primary/15'
                    ]
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative">
                    <Icon 
                      className={cn(
                        'h-5 w-5',
                        item.isSpecial && 'h-6 w-6'
                      )} 
                    />
                    
                    {/* Badge for notifications/cart items */}
                    {item.badge !== null && (
                      <Badge 
                        variant="destructive" 
                        className={cn(
                          'absolute -top-2 -right-2',
                          'h-5 w-5 flex items-center justify-center',
                          'text-xs font-bold min-w-[20px] px-1',
                          'animate-in fade-in-0 zoom-in-50 duration-200'
                        )}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                    
                    {/* Cart badge for shopping bag icon */}
                    {item.href === '/buying/cart' && cartItems > 0 && (
                      <Badge 
                        variant="destructive" 
                        className={cn(
                          'absolute -top-2 -right-2',
                          'h-5 w-5 flex items-center justify-center',
                          'text-xs font-bold min-w-[20px] px-1',
                          'animate-in fade-in-0 zoom-in-50 duration-200'
                        )}
                      >
                        {cartItems > 99 ? '99+' : cartItems}
                      </Badge>
                    )}
                  </div>
                  
                  <span 
                    className={cn(
                      'text-[10px] leading-none',
                      'max-w-full truncate',
                      item.isSpecial && 'font-semibold'
                    )}
                  >
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}

// Secondary actions bottom sheet trigger (for less common actions)
export function SecondaryActionsNav(): React.JSX.Element {
  const { getTotalItems } = useCartStore();
  const [cartItems, setCartItems] = useState(0);

  useEffect(() => {
    setCartItems(getTotalItems());
  }, [getTotalItems]);

  const secondaryActions = [
    {
      href: '/buying/cart',
      icon: ShoppingBag, 
      label: 'Cart',
      badge: cartItems > 0 ? cartItems : null,
    },
    {
      href: '/favorites',
      icon: Heart,
      label: 'Favorites',
      badge: null,
    },
  ];

  return (
    <div className="fixed top-4 right-4 z-40 md:hidden">
      <div className="flex flex-col gap-2">
        {secondaryActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Link key={action.href} href={action.href}>
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  'relative h-12 w-12 rounded-full',
                  'shadow-lg shadow-black/10',
                  'bg-background/95 backdrop-blur',
                  'border border-border/50',
                  'hover:bg-accent active:bg-accent/80',
                  'transition-all duration-200'
                )}
                aria-label={action.label}
              >
                <Icon className="h-5 w-5" />
                
                {action.badge !== null && action.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className={cn(
                      'absolute -top-1 -right-1',
                      'h-5 w-5 flex items-center justify-center',
                      'text-xs font-bold min-w-[20px] px-1'
                    )}
                  >
                    {action.badge > 99 ? '99+' : action.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}