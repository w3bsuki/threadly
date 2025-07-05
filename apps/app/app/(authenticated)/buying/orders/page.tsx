import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Package, Eye, ShoppingCart, Star, ExternalLink } from 'lucide-react';
import Image from 'next/image';

const title = 'My Orders';
const description = 'Track your orders and purchases';

export const metadata: Metadata = {
  title,
  description,
};

const MyOrdersPage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get database user with just ID for performance  
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Fetch user's orders
  const orders = await database.order.findMany({
    where: {
      buyerId: dbUser.id,
    },
    include: {
      product: {
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
      seller: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      payment: {
        select: {
          id: true,
          status: true
        }
      },
      review: {
        select: {
          id: true
        }
      }
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
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and order history
          </p>
        </div>
        <Button asChild>
          <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Continue Shopping
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Start shopping to see your orders here
              </p>
              <Button asChild>
                <a href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'} target="_blank" rel="noopener noreferrer">
                  Start Shopping
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      <p className="text-lg font-semibold mt-1">
                        ${order.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Product Info */}
                  <div className="flex gap-3 mb-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      {order.product?.images[0] ? (
                        <Image
                          src={order.product.images[0].imageUrl}
                          alt={order.product.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{order.product.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Condition: {order.product.condition}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground">
                          Sold by: {order.seller.firstName && order.seller.lastName 
                            ? `${order.seller.firstName} ${order.seller.lastName}` 
                            : order.seller.email}
                        </span>
                        <span className="font-medium">
                          ${order.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-1">Payment Status</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.payment ? 'Paid' : 'Pending'}
                        </p>
                      </div>
                      
                      {order.trackingNumber && (
                        <div>
                          <h4 className="font-medium text-sm mb-1">Tracking Number</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/buying/orders/${order.id}`}>
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    
                    {order.status === 'DELIVERED' && !order.review && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/reviews">
                          <Star className="h-3 w-3 mr-1" />
                          Leave Review
                        </Link>
                      </Button>
                    )}
                    
                    {order.status === 'DELIVERED' && order.review && (
                      <Button variant="ghost" size="sm" disabled>
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        Reviewed
                      </Button>
                    )}
                    
                    {order.status === 'PENDING' && (
                      <Button variant="destructive" size="sm">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      )}

      {/* Order Summary Stats */}
        {orders.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'DELIVERED').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'PENDING' || o.status === 'PAID' || o.status === 'SHIPPED').length}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    ${orders.reduce((sum, o) => sum + o.amount.toNumber(), 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};

export default MyOrdersPage;