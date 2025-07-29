import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import { Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface RecentOrdersProps {
  orders: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    buyerId: string;
    productId: string;
  }>;
  dictionary: Dictionary;
}

export function RecentOrders({ orders, dictionary }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <Card className="overflow-hidden border-gray-800 bg-foreground">
        <CardHeader className="border-gray-800 border-b px-4 pb-3">
          <CardTitle className="font-medium text-background text-base">
            {dictionary.dashboard.dashboard.recentOrders.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-4 pb-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No recent orders yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-gray-800 bg-foreground">
      <CardHeader className="flex flex-row items-center justify-between border-gray-800 border-b px-4 pb-3">
        <CardTitle className="font-medium text-background text-base">
          {dictionary.dashboard.dashboard.recentOrders.title}
        </CardTitle>
        <Link
          className="text-muted-foreground text-xs transition-colors hover:text-background"
          href="/selling/orders"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-4 pt-4 pb-4">
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-gray-800 bg-foreground/30 p-2 transition-colors hover:bg-foreground/50"
              key={order.id}
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-foreground">
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-background text-sm">
                  #{order.id.slice(-8)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium text-background text-sm">
                  ${Number(order.amount).toFixed(2)}
                </p>
                <Badge
                  className="text-xs"
                  variant={
                    order.status === 'DELIVERED'
                      ? 'default'
                      : order.status === 'SHIPPED'
                        ? 'secondary'
                        : order.status === 'PENDING'
                          ? 'outline'
                          : 'destructive'
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
