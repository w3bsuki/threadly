import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { ShoppingBag, Package } from 'lucide-react';
import type { Dictionary } from '@repo/internationalization';
import { getCacheService } from '@repo/cache';
import { database } from '@repo/database';
import { decimalToNumber } from '@repo/utils';
import { ErrorBoundary } from '@/components/error-boundary';
import { cn } from '@repo/design-system/lib/utils';

interface ActivePurchasesProps {
  userId: string;
  dictionary: Dictionary;
}

interface Purchase {
  id: string;
  status: string;
  createdAt: Date;
  amount: number;
  product: {
    id: string;
    title: string;
    price: number;
    images: {
      imageUrl: string;
      displayOrder: number;
    }[];
  };
}

async function getActivePurchases(userId: string): Promise<Purchase[]> {
  const cache = getCacheService();
  const cacheKey = `dashboard:active-purchases:${userId}`;
  
  return await cache.remember(
    cacheKey,
    async () => {
      const orders = await database.order.findMany({
        where: {
          buyerId: userId,
          status: {
            in: ['PENDING', 'SHIPPED']
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          status: true,
          createdAt: true,
          amount: true,
          Product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                select: {
                  imageUrl: true,
                  displayOrder: true
                },
                orderBy: { displayOrder: 'asc' },
                take: 1
              }
            }
          }
        }
      });
      
      return orders.map(order => ({
        ...order,
        amount: Number(order.amount),
        product: {
          ...order.Product,
          price: Number(order.Product.price)
        }
      }));
    },
    300
  );
}

export async function ActivePurchases({ userId, dictionary }: ActivePurchasesProps) {
  const purchases = await getActivePurchases(userId);

  if (purchases.length === 0) {
    return (
      <ErrorBoundary>
        <Card className="overflow-hidden bg-background border-border">
          <CardHeader className="pb-3 px-4 border-b border-border">
            <CardTitle className="text-base font-medium text-foreground">
              Your Active Purchases
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-6 pt-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="rounded-full bg-secondary p-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-base font-medium text-foreground">
                  No active purchases
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse our collection and find something you love
                </p>
              </div>
              <Link href="/products" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  Browse products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </ErrorBoundary>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'PROCESSING':
        return 'text-blue-600 dark:text-blue-400';
      case 'SHIPPED':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'PROCESSING':
        return 'Processing';
      case 'SHIPPED':
        return 'Shipped';
      default:
        return status;
    }
  };

  return (
    <ErrorBoundary>
      <Card className="overflow-hidden bg-background border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 border-b border-border">
          <CardTitle className="text-base font-medium text-foreground">
            Your Active Purchases
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link
              href="/buying/orders"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {purchases.map((purchase) => (
              <Link 
                key={purchase.id} 
                href={`/buying/orders/${purchase.id}`}
                className="block no-touch-target flex-shrink-0"
              >
                <div className="space-y-1.5 w-32 sm:w-36">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary">
                    {purchase.product.images[0] ? (
                      <Image
                        src={purchase.product.images[0].imageUrl}
                        alt={purchase.product.title}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5">
                      <div className={cn(
                        "text-background rounded px-1.5 py-0.5 text-[10px] font-medium",
                        purchase.status === 'PENDING' && "bg-yellow-600",
                        purchase.status === 'SHIPPED' && "bg-green-600"
                      )}>
                        {getStatusLabel(purchase.status)}
                      </div>
                    </div>
                    <div className="absolute top-1.5 right-1.5">
                      <div className="bg-foreground/80 text-background rounded px-1.5 py-0.5 text-xs font-semibold">
                        ${decimalToNumber(purchase.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="px-0.5">
                    <p className="text-xs font-medium text-foreground truncate">
                      {purchase.product.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(purchase.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}