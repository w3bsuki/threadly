import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { Package, ArrowRight, Clock, CheckCircle, Truck } from 'lucide-react';
import Link from 'next/link';
import { decimalToNumber } from '@repo/utils';
import type { Dictionary } from '@repo/internationalization';

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
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export async function ModernRecentOrders({ userId, dictionary }: ModernRecentOrdersProps) {
  // Get recent orders (both as buyer and seller)
  const [buyingOrders, sellingOrders] = await Promise.all([
    database.order.findMany({
      where: { buyerId: userId },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' }
            }
          }
        },
        seller: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    }),
    database.order.findMany({
      where: { sellerId: userId },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' }
            }
          }
        },
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ]);

  const allOrders = [...buyingOrders, ...sellingOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (allOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No recent orders</p>
            <p className="text-xs text-muted-foreground mt-1">
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
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="min-h-[44px] touch-manipulation transition-all duration-200 active:scale-95"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Link href="/buying/orders">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allOrders.map((order) => {
            const isBuying = order.buyerId === userId;
            const otherUser = isBuying 
              ? 'seller' in order ? order.seller : null
              : 'buyer' in order ? order.buyer : null;
            const amount = order.amount ? decimalToNumber(order.amount) : 0;
            
            return (
              <Link 
                key={order.id} 
                href={`/buying/orders/${order.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors min-h-[72px] touch-manipulation active:scale-95 duration-200"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  {order.product.images[0] ? (
                    <img
                      src={order.product.images[0].imageUrl}
                      alt={order.product.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center border">
                    {isBuying ? (
                      <ArrowRight className="h-3 w-3 text-blue-600" />
                    ) : (
                      <ArrowRight className="h-3 w-3 text-green-600 rotate-180" />
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.product.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={otherUser?.imageUrl || undefined} />
                          <AvatarFallback className="text-[10px]">
                            {otherUser?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {isBuying ? 'from' : 'to'} {otherUser?.firstName || 'User'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">
                        ${amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusColor(order.status)}`}>
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