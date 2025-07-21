import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Package } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';

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
      <Card className="overflow-hidden bg-foreground border-gray-800">
        <CardHeader className="pb-3 px-4 border-b border-gray-800">
          <CardTitle className="text-base font-medium text-background">{dictionary.dashboard.dashboard.recentOrders.title}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No recent orders yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-foreground border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 border-b border-gray-800">
        <CardTitle className="text-base font-medium text-background">{dictionary.dashboard.dashboard.recentOrders.title}</CardTitle>
        <Link
          href="/selling/orders"
          className="text-xs text-muted-foreground hover:text-background transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-4">
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center gap-3 p-2 rounded-[var(--radius-lg)] bg-foreground/30 hover:bg-foreground/50 transition-colors border border-gray-800">
              <div className="relative h-10 w-10 rounded-[var(--radius-lg)] overflow-hidden bg-foreground shrink-0">
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-background">
                  #{order.id.slice(-8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-background">
                  ${Number(order.amount).toFixed(2)}
                </p>
                <Badge variant={
                  order.status === 'DELIVERED' ? 'default' :
                  order.status === 'SHIPPED' ? 'secondary' :
                  order.status === 'PENDING' ? 'outline' : 'destructive'
                } className="text-xs">
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