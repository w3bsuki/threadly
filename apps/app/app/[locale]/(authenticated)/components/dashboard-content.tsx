'use client';

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
import { decimalToNumber } from '@repo/utils';
import type { Dictionary } from '@repo/internationalization';

interface DashboardContentProps {
  user: {
    id: string;
    firstName: string | null;
    imageUrl: string;
  };
  dictionary: Dictionary;
  metrics: {
    activeListings: number;
    totalRevenue: number;
    completedSales: number;
    unreadMessages: number;
  };
  recentOrders: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: Date;
    product: {
      id: string;
      title: string;
      images: Array<{
        imageUrl: string;
      }>;
    };
  }>;
}

export function DashboardContent({ user, dictionary, metrics, recentOrders }: DashboardContentProps): React.JSX.Element {
  const { activeListings, totalRevenue, completedSales, unreadMessages } = metrics;

  return (
    <div className="space-y-6">
      
      {/* Clean Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{dictionary.dashboard.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1">
          {dictionary.dashboard.dashboard.welcomeMessage.replace('{{name}}', user.firstName || '')}
        </p>
      </div>

      {/* Key Metrics - Clean Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">{dictionary.dashboard.dashboard.metrics.totalRevenue}</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${((totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedSales} {dictionary.dashboard.dashboard.metrics.completedSales}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">{dictionary.dashboard.dashboard.metrics.activeListings}</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeListings}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary.dashboard.dashboard.metrics.itemsCurrentlyForSale}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">{dictionary.dashboard.dashboard.metrics.messages}</CardTitle>
            <MessageCircleIcon className="h-4 w-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              {dictionary.dashboard.dashboard.metrics.unreadMessages}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">{dictionary.dashboard.dashboard.metrics.quickAction}</CardTitle>
            <PlusIcon className="h-4 w-4 text-muted-foreground/70" />
          </CardHeader>
          <CardContent>
            <Link href="/selling/new">
              <Button className="w-full bg-primary text-background hover:bg-primary/90">
                <PlusIcon className="mr-2 h-4 w-4" />
                {dictionary.dashboard.dashboard.actions.listNewItem}
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
            <CardTitle>{dictionary.dashboard.dashboard.recentOrders.title}</CardTitle>
            <CardDescription>{dictionary.dashboard.dashboard.recentOrders.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-[var(--radius-md)] overflow-hidden bg-muted relative">
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
                        ${(decimalToNumber(order.amount) / 100).toFixed(2)}
                      </p>
                    </div>
                    <Badge variant={
                      order.status === 'DELIVERED' ? 'default' :
                      order.status === 'PENDING' ? 'secondary' :
                      order.status === 'SHIPPED' ? 'outline' : 'destructive'
                    }>
                      {order.status === 'DELIVERED' ? dictionary.dashboard.orders.delivered :
                       order.status === 'PENDING' ? dictionary.dashboard.orders.pending :
                       order.status === 'SHIPPED' ? dictionary.dashboard.orders.shipped :
                       order.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
                <Link href="/buying/orders">
                  <Button variant="outline" className="w-full">
                    {dictionary.dashboard.dashboard.recentOrders.viewAllOrders}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">{dictionary.dashboard.dashboard.recentOrders.noOrdersTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dictionary.dashboard.dashboard.recentOrders.noOrdersDescription}
                </p>
                <div className="mt-6">
                  <a
                    href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>
                      <HeartIcon className="mr-2 h-4 w-4" />
                      {dictionary.dashboard.dashboard.recentOrders.browseShop}
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
            <CardTitle>{dictionary.dashboard.dashboard.quickLinks.title}</CardTitle>
            <CardDescription>{dictionary.dashboard.dashboard.quickLinks.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/selling/listings">
                <Button variant="ghost" className="w-full justify-start hover:bg-muted">
                  <PackageIcon className="mr-2 h-4 w-4" />
                  {dictionary.dashboard.dashboard.quickLinks.manageListings}
                </Button>
              </Link>
              <Link href="/selling/history">
                <Button variant="ghost" className="w-full justify-start hover:bg-muted">
                  <TrendingUpIcon className="mr-2 h-4 w-4" />
                  {dictionary.dashboard.dashboard.quickLinks.salesHistory}
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost" className="w-full justify-start hover:bg-muted">
                  <MessageCircleIcon className="mr-2 h-4 w-4" />
                  {dictionary.dashboard.navigation.messages}
                  {unreadMessages > 0 && (
                    <Badge className="ml-auto bg-primary text-background">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start hover:bg-muted">
                  <EyeIcon className="mr-2 h-4 w-4" />
                  {dictionary.dashboard.dashboard.quickLinks.profileSettings}
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
            <CardTitle>{dictionary.dashboard.dashboard.gettingStarted.title}</CardTitle>
            <CardDescription>{dictionary.dashboard.dashboard.gettingStarted.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="rounded-[var(--radius-full)] bg-primary/10 p-3 mx-auto w-fit">
                  <PlusIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 font-semibold">{dictionary.dashboard.dashboard.gettingStarted.listFirstItem}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dictionary.dashboard.dashboard.gettingStarted.listItemDescription}
                </p>
                <Link href="/selling/new">
                  <Button className="mt-3" size="sm">{dictionary.dashboard.dashboard.gettingStarted.getStarted}</Button>
                </Link>
              </div>
              <div className="text-center">
                <div className="rounded-[var(--radius-full)] bg-primary/10 p-3 mx-auto w-fit">
                  <HeartIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 font-semibold">{dictionary.dashboard.dashboard.gettingStarted.exploreShop}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dictionary.dashboard.dashboard.gettingStarted.exploreDescription}
                </p>
                <a
                  href={process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="mt-3" size="sm">
                    {dictionary.dashboard.dashboard.gettingStarted.browseNow}
                  </Button>
                </a>
              </div>
              <div className="text-center">
                <div className="rounded-[var(--radius-full)] bg-primary/10 p-3 mx-auto w-fit">
                  <EyeIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-2 font-semibold">{dictionary.dashboard.dashboard.gettingStarted.completeProfile}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dictionary.dashboard.dashboard.gettingStarted.profileDescription}
                </p>
                <Link href="/profile">
                  <Button variant="outline" className="mt-3" size="sm">
                    {dictionary.dashboard.dashboard.gettingStarted.editProfile}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}