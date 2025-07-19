import { database } from '@repo/database';
import { cache } from '@repo/cache';
import Link from 'next/link';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Package, Eye, ShoppingCart, Star, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { decimalToNumber } from '@repo/utils';

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
                  imageUrl: true
                }
              },
            },
          },
          User_Order_sellerIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          Payment: {
            select: {
              id: true,
              status: true
            }
          },
          Review: {
            select: {
              id: true
            }
          }
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
          <div className="rounded-[var(--radius-full)] bg-secondary dark:bg-secondary-foreground p-3 mb-4">
            <Package className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">No orders yet</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
            Start shopping to see your orders here
          </p>
          <Button size="sm" asChild>
            <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer">
              Start Shopping
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">
                  Order #{order.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <Badge className={`${getStatusColor(order.status)} text-[10px] px-1.5 py-0.5`}>
                  {getStatusText(order.status)}
                </Badge>
                <p className="text-sm font-semibold mt-1">
                  ${(decimalToNumber(order.amount) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          
            {/* Product Info */}
            <div className="flex gap-3">
              <div className="relative w-14 h-14 flex-shrink-0">
                {order.Product?.images[0] ? (
                  <Image
                    src={order.Product.images[0].imageUrl}
                    alt={order.Product.title}
                    fill
                    className="object-cover rounded-[var(--radius-lg)]"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-[var(--radius-lg)] flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium line-clamp-1">{order.Product.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {order.Product.condition.replace(/_/g, ' ').toLowerCase()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seller: {order.User_Order_sellerIdToUser.firstName || 'Anonymous'}
                </p>
              </div>
            </div>

            {/* Order Information */}
            {order.trackingNumber && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Tracking: <span className="font-medium">{order.trackingNumber}</span>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t">
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link href={`/buying/orders/${order.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </Link>
              </Button>
              
              <div className="flex gap-1.5">
                {order.status === 'DELIVERED' && !order.Review && (
                  <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                    <Link href="/reviews/mobile?tab=write&orderId={order.id}">
                      <Star className="h-3 w-3 mr-1" />
                      Review
                    </Link>
                  </Button>
                )}
                
                {order.status === 'DELIVERED' && order.Review && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                    <Star className="h-2.5 w-2.5 mr-0.5 fill-yellow-400 text-yellow-400" />
                    Reviewed
                  </Badge>
                )}
                
                {order.status === 'PENDING' && (
                  <Button variant="destructive" size="sm" className="h-7 text-xs">
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