import { database } from '@repo/database';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import type { Dictionary } from '@repo/internationalization';
import { decimalToNumber } from '@repo/utils';
import { ArrowRight, CheckCircle, Clock, Package, Truck } from 'lucide-react';
import Link from 'next/link';

interface ModernRecentOrdersProps {
  userId: string;
  dictionary: Dictionary;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-3 w-3" />;
    case 'PAID':
      return <Package className="h-3 w-3" />;
    case 'SHIPPED':
      return <Truck className="h-3 w-3" />;
    case 'DELIVERED':
      return <CheckCircle className="h-3 w-3" />;
    default:
      return <Package className="h-3 w-3" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'PAID':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
};

export async function ModernRecentOrders({
  userId,
  dictionary,
}: ModernRecentOrdersProps) {
  // Get recent orders (both as buyer and seller)
  const [buyingOrders, sellingOrders] = await Promise.all([
    database.order.findMany({
      where: { buyerId: userId },
      include: {
        Product: {
          include: {
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        User_Order_sellerIdToUser: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    database.order.findMany({
      where: { sellerId: userId },
      include: {
        Product: {
          include: {
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        User_Order_buyerIdToUser: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  const allOrders = [...buyingOrders, ...sellingOrders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  if (allOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold text-lg">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No recent orders</p>
            <p className="mt-1 text-muted-foreground text-xs">
              Start buying or selling to see activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-lg">
            Recent Activity
          </CardTitle>
          <Button
            asChild
            className="min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
            size="sm"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            variant="ghost"
          >
            <Link href="/buying/orders">
              View All
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allOrders.map((order) => {
            const isBuying = order.buyerId === userId;
            const otherUser = isBuying
              ? 'User_Order_sellerIdToUser' in order
                ? order.User_Order_sellerIdToUser
                : null
              : 'User_Order_buyerIdToUser' in order
                ? order.User_Order_buyerIdToUser
                : null;
            const amount = order.amount ? decimalToNumber(order.amount) : 0;

            return (
              <Link
                className="flex min-h-[72px] touch-manipulation items-center gap-3 rounded-[var(--radius-lg)] p-3 transition-colors duration-200 hover:bg-accent/50 active:scale-95"
                href={`/buying/orders/${order.id}`}
                key={order.id}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  {order.Product.images[0] ? (
                    <img
                      alt={order.Product.title}
                      className="h-12 w-12 rounded-[var(--radius-lg)] object-cover"
                      src={order.Product.images[0].imageUrl}
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="-bottom-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] border bg-background">
                    {isBuying ? (
                      <ArrowRight className="h-3 w-3 text-blue-600" />
                    ) : (
                      <ArrowRight className="h-3 w-3 rotate-180 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        {order.Product.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={otherUser?.imageUrl || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {otherUser?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground text-xs">
                          {isBuying ? 'from' : 'to'}{' '}
                          {otherUser?.firstName || 'User'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold text-sm">
                        ${amount.toFixed(2)}
                      </p>
                      <Badge
                        className={`px-1.5 py-0 text-[10px] ${getStatusColor(order.status)}`}
                        variant="outline"
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
