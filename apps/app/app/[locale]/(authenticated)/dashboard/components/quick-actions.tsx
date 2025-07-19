'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { cn } from '@repo/design-system/lib/utils';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  MessageSquare,
  ShoppingBag,
  Settings,
  Crown,
  Eye,
} from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface QuickActionsProps {
  dictionary: Dictionary;
}

interface ActionButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  external?: boolean;
  variant?: 'default' | 'primary';
}

function ActionButton({ href, icon: Icon, label, description, external, variant = 'default' }: ActionButtonProps) {
  const className = cn(
    "flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border transition-all active:scale-95",
    "touch-manipulation",
    variant === 'primary' 
      ? "bg-background text-foreground border-background hover:bg-secondary"
      : "bg-foreground/50 text-background border-gray-800 hover:bg-foreground/70 hover:border-gray-700"
  );

  const content = (
    <>
      <div className={cn(
        "rounded-[var(--radius-full)] p-2",
        variant === 'primary' ? "bg-foreground/10" : "bg-background/10"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </>
  );

  if (external) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function QuickActions({ dictionary }: QuickActionsProps) {
  const actions = [
    {
      href: '/selling/new',
      icon: Plus,
      label: 'New Listing',
      variant: 'primary' as const,
    },
    {
      href: '/selling/orders',
      icon: ShoppingBag,
      label: 'Orders',
    },
    {
      href: '/selling/listings',
      icon: Package,
      label: 'My Listings',
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Messages',
    },
    {
      href: '/selling/analytics',
      icon: TrendingUp,
      label: 'Analytics',
    },
    {
      href: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
      icon: Crown,
      label: 'Browse Shop',
      external: true,
    },
  ];

  return (
    <Card className="overflow-hidden bg-foreground border-gray-800">
      <CardHeader className="pb-3 px-4 border-b border-gray-800">
        <CardTitle className="text-base font-medium text-background">{dictionary.dashboard.dashboard.quickActions}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}