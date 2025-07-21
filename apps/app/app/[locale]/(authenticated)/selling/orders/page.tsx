import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Header } from '../../components/header';
import { OrderActions } from './components/order-actions';
import Link from 'next/link';
import { decimalToNumber } from '@repo/utils';
import { getDictionary } from '@repo/internationalization';
import { formatCurrency, formatDate } from '@/lib/locale-format';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: dictionary.dashboard.orders.title,
    description: dictionary.dashboard.orders.title,
  };
}

const OrdersPage = async ({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  // Get database user
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    redirect(`/${locale}/selling/listings`);
  }

  // Fetch orders where this user is the seller
  const orders = await database.order.findMany({
    where: {
      sellerId: dbUser.id,
    },
    include: {
      Product: {
        include: {
          images: {
            orderBy: {
              displayOrder: 'asc',
            },
            take: 1,
          },
        },
      },
      User_Order_buyerIdToUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      Payment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

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
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      case 'PAID':
        return <Package className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    paid: orders.filter(o => o.status === 'PAID').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    revenue: orders.filter(o => o.status !== 'CANCELLED').reduce((sum, o) => sum + decimalToNumber(o.amount), 0),
  };

  return (
    <>
      <Header pages={['Dashboard', 'Selling', 'Orders']} page="Orders" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              Track and fulfill your sales orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                <p className="text-sm text-muted-foreground">Shipped</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  Once customers purchase your items, orders will appear here
                </p>
                <Button asChild>
                  <Link href="/selling/listings">
                    View My Listings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0">
                      {order.Product.images[0] ? (
                        <img
                          src={order.Product.images[0].imageUrl}
                          alt={order.Product.title}
                          className="w-full h-full object-cover rounded-[var(--radius-md)]"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-[var(--radius-md)] flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.Product.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Buyer: {order.User_Order_buyerIdToUser.firstName} {order.User_Order_buyerIdToUser.lastName}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold">${decimalToNumber(order.amount).toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                        {order.Payment && (
                          <p>Payment: ${decimalToNumber(order.Payment.amount).toFixed(2)} ({order.Payment.status})</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4">
                        <OrderActions
                          orderId={order.id}
                          status={order.status}
                          productTitle={order.Product.title}
                          buyerName={`${order.User_Order_buyerIdToUser.firstName} ${order.User_Order_buyerIdToUser.lastName}`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;