import { cache } from '@repo/database';
import { database } from '@repo/database';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components';
import { decimalToNumber } from '@repo/utils';
import { ExternalLink, Eye, Package, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrdersListProps {
  userId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAID':
      return 'bg-blue-100 text-blue-800';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'REFUNDED':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Payment Pending';
    case 'PAID':
      return 'Paid - Processing';
    case 'SHIPPED':
      return 'Shipped';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return status;
  }
};

export async function OrdersList({ userId }: OrdersListProps) {
  const orders = await cache.remember(
    `buyer_orders:${userId}`,
    async () => {
      return database.order.findMany({
        where: {
          buyerId: userId,
        },
        take: 20,
        include: {
          Product: {
            select: {
              id: true,
              title: true,
              condition: true,
              images: {
                take: 1,
                orderBy: {
                  displayOrder: 'asc',
                },
                select: {
                  imageUrl: true,
                },
              },
            },
          },
          User_Order_sellerIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          Payment: {
            select: {
              id: true,
              status: true,
            },
          },
          Review: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    },
    cache.TTL.SHORT
  );

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 rounded-[var(--radius-full)] bg-secondary p-3 dark:bg-secondary-foreground">
            <Package className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-medium text-base">No orders yet</h3>
          <p className="mb-4 max-w-sm text-center text-muted-foreground text-sm">
            Start shopping to see your orders here
          </p>
          <Button asChild size="sm">
            <a
              href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
              rel="noopener noreferrer"
              target="_blank"
            >
              Start Shopping
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card className="overflow-hidden" key={order.id}>
          <div className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <Badge
                  className={`${getStatusColor(order.status)} px-1.5 py-0.5 text-[10px]`}
                >
                  {getStatusText(order.status)}
                </Badge>
                <p className="mt-1 font-semibold text-sm">
                  ${(decimalToNumber(order.amount) / 100).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex gap-3">
              <div className="relative h-14 w-14 flex-shrink-0">
                {order.Product?.images[0] ? (
                  <Image
                    alt={order.Product.title}
                    className="rounded-[var(--radius-lg)] object-cover"
                    fill
                    src={order.Product.images[0].imageUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-lg)] bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 font-medium text-sm">
                  {order.Product.title}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {order.Product.condition.replace(/_/g, ' ').toLowerCase()}
                </p>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Seller:{' '}
                  {order.User_Order_sellerIdToUser.firstName || 'Anonymous'}
                </p>
              </div>
            </div>

            {/* Order Information */}
            {order.trackingNumber && (
              <div className="mt-2 border-t pt-2">
                <p className="text-muted-foreground text-xs">
                  Tracking:{' '}
                  <span className="font-medium">{order.trackingNumber}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
              <Button asChild className="h-7 text-xs" size="sm" variant="ghost">
                <Link href={`/buying/orders/${order.id}`}>
                  <Eye className="mr-1 h-3 w-3" />
                  Details
                </Link>
              </Button>

              <div className="flex gap-1.5">
                {order.status === 'DELIVERED' && !order.Review && (
                  <Button
                    asChild
                    className="h-7 text-xs"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/reviews/mobile?tab=write&orderId={order.id}">
                      <Star className="mr-1 h-3 w-3" />
                      Review
                    </Link>
                  </Button>
                )}

                {order.status === 'DELIVERED' && order.Review && (
                  <Badge
                    className="px-1.5 py-0.5 text-[10px]"
                    variant="secondary"
                  >
                    <Star className="mr-0.5 h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    Reviewed
                  </Badge>
                )}

                {order.status === 'PENDING' && (
                  <Button
                    className="h-7 text-xs"
                    size="sm"
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
