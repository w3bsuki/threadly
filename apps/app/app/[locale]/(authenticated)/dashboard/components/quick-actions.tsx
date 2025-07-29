'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { cn } from '@repo/ui/lib/utils';
import type { Dictionary } from '@repo/internationalization';
import {
  Crown,
  Eye,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

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

function ActionButton({
  href,
  icon: Icon,
  label,
  description,
  external,
  variant = 'default',
}: ActionButtonProps) {
  const className = cn(
    'flex items-center gap-3 rounded-[var(--radius-lg)] border p-3 transition-all active:scale-95',
    'touch-manipulation',
    variant === 'primary'
      ? 'border-background bg-background text-foreground hover:bg-secondary'
      : 'border-gray-800 bg-foreground/50 text-background hover:border-gray-700 hover:bg-foreground/70'
  );

  const content = (
    <>
      <div
        className={cn(
          'rounded-[var(--radius-full)] p-2',
          variant === 'primary' ? 'bg-foreground/10' : 'bg-background/10'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <span className="font-medium text-sm">{label}</span>
    </>
  );

  if (external) {
    return (
      <a
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
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
    <Card className="overflow-hidden border-gray-800 bg-foreground">
      <CardHeader className="border-gray-800 border-b px-4 pb-3">
        <CardTitle className="font-medium text-background text-base">
          {dictionary.dashboard.dashboard.quickActions}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
