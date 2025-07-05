import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@repo/design-system/components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import Image from 'next/image';
import { 
  PlusIcon, 
  PackageIcon, 
  DollarSignIcon, 
  TrendingUpIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
  EyeIcon,
  HeartIcon
} from 'lucide-react';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const title = 'Dashboard - Threadly';
const description = 'Manage your listings, orders, and account.';

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const user = await currentUser();

  if (!user) {
    return null; // This should be handled by the layout auth check
  }

  // Get or create database user
  let dbUser;
  try {
    dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
        select: { id: true }
      });
    }
  } catch (error) {
    logError('Database error:', error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Simplified queries for better performance with error handling
  let activeListings = 0;
  let totalSales: any = { _sum: { amount: null }, _count: 0 };
  let recentOrders: any[] = [];

  try {
    [activeListings, totalSales, recentOrders] = await Promise.all([
      database.product.count({
        where: {
          sellerId: dbUser.id,
          status: 'AVAILABLE'
        }
      }),
      database.order.aggregate({
        where: {
          sellerId: dbUser.id,
          status: 'DELIVERED'
        },
        _sum: { amount: true },
        _count: true
      }),
      database.order.findMany({
        where: {
          buyerId: dbUser.id
        },
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              title: true,
              images: {
                take: 1,
                orderBy: { displayOrder: 'asc' },
                select: {
                  imageUrl: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      })
    ]);
  } catch (error) {
    logError('Error fetching dashboard data:', error);
    // Use default values if queries fail
  }

  // Simplified unread messages count - just set to 0 for now to avoid complex query
  const unreadMessages = 0;

  const totalRevenue = totalSales?._sum?.amount ? totalSales._sum.amount.toNumber() : 0;
  const completedSales = totalSales?._count || 0;

  return (
    <div className="space-y-6">
      
      {/* Clean Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user.firstName}. Here's what's happening with your account.
        </p>
      </div>

      {/* Key Metrics - Clean Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              ${((totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              From {completedSales} completed sales
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active Listings</CardTitle>
            <PackageIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{activeListings}</div>
            <p className="text-xs text-gray-500">
              Items currently for sale
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Messages</CardTitle>
            <MessageCircleIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{unreadMessages}</div>
            <p className="text-xs text-gray-500">
              Unread messages
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Quick Action</CardTitle>
            <PlusIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <Link href="/selling/new">
              <Button className="w-full bg-black text-white hover:bg-gray-800">
                <PlusIcon className="mr-2 h-4 w-4" />
                List New Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Orders */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted relative">
                      <Image
                        src={order.product.images[0]?.imageUrl || ''}
                        alt={order.product.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.product.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${((order.amount || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={
                      order.status === 'DELIVERED' ? 'default' :
                      order.status === 'PENDING' ? 'secondary' :
                      order.status === 'SHIPPED' ? 'outline' : 'destructive'
                    }>
                      {order.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
                <Link href="/buying/orders">
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">No orders yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start shopping to see your orders here.
                </p>
                <div className="mt-6">
                  <a
                    href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>
                      <HeartIcon className="mr-2 h-4 w-4" />
                      Browse Shop
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Common actions and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/selling/listings">
                <Button variant="ghost" className="w-full justify-start hover:bg-gray-50">
                  <PackageIcon className="mr-2 h-4 w-4" />
                  Manage My Listings
                </Button>
              </Link>
              <Link href="/selling/history">
                <Button variant="ghost" className="w-full justify-start hover:bg-gray-50">
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  Sales History
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" className="w-full justify-start hover:bg-gray-50">
                  <MessageCircleIcon className="mr-2 h-4 w-4" />
                  Messages
                  {unreadMessages > 0 && (
                    <Badge className="ml-auto bg-black text-white">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start hover:bg-gray-50">
                  <EyeIcon className="mr-2 h-4 w-4" />
                  Profile Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started (for new users) */}
      {activeListings === 0 && completedSales === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Threadly</CardTitle>
            <CardDescription>Welcome! Here's how to make the most of your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-3 mx-auto w-fit">
                  <PlusIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 font-semibold">List Your First Item</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload photos and details of items you want to sell.
                </p>
                <Link href="/selling/new">
                  <Button className="mt-3" size="sm">Get Started</Button>
                </Link>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-3 mx-auto w-fit">
                  <HeartIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 font-semibold">Explore the Shop</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse thousands of unique fashion items.
                </p>
                <a
                  href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="mt-3" size="sm">
                    Browse Now
                  </Button>
                </a>
              </div>
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-3 mx-auto w-fit">
                  <EyeIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 font-semibold">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your details to build trust with buyers.
                </p>
                <Link href="/profile">
                  <Button variant="outline" className="mt-3" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default App;
