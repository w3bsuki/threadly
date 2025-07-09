'use client';

import Link from 'next/link';
import { Button } from '@repo/design-system/components';
import { PlusIcon, HeartIcon } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

interface QuickActionsProps {
  dictionary: Dictionary;
}

export function QuickActions({ dictionary }: QuickActionsProps) {
  return (
    <div className="border border-border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        {dictionary.dashboard.dashboard.quickActions}
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Button asChild className="h-auto p-4 justify-start">
          <Link href="/selling/new" className="flex items-center space-x-3">
            <PlusIcon className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">
                {dictionary.dashboard.dashboard.actions.listNewItem}
              </p>
              <p className="text-sm opacity-80">
                Start selling your items
              </p>
            </div>
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto p-4 justify-start">
          <a
            href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3"
          >
            <HeartIcon className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">
                {dictionary.dashboard.dashboard.recentOrders.browseShop}
              </p>
              <p className="text-sm opacity-80">
                Discover new items
              </p>
            </div>
          </a>
        </Button>
      </div>
    </div>
  );
}