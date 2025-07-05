'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/design-system/components';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/design-system/components';
import { CalendarIcon, DollarSign, Package, TrendingUp, ShoppingBag, Star, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

interface SalesData {
  _sum: {
    amount: number | null;
  };
  _count: {
    id: number;
  };
}

interface Order {
  id: string;
  status: string;
  amount: number;
  createdAt: Date;
  buyer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  product: {
    id: string;
    title: string;
    status: string;
    images: Array<{
      imageUrl: string;
      alt: string | null;
    }>;
  };
}

interface MonthlyStats {
  month: string;
  total_sales: bigint;
  order_count: bigint;
}

interface TopProduct {
  productId: string;
  _sum: {
    amount: number | null;
  };
  _count: {
    id: number;
  };
  product?: {
    id: string;
    title: string;
    price: number;
    status: string;
    images: Array<{
      imageUrl: string;
      alt: string | null;
    }>;
  };
}

interface SalesHistoryContentProps {
  salesData: SalesData;
  recentOrders: Order[];
  monthlyStats: MonthlyStats[];
  topProducts: TopProduct[];
}

export function SalesHistoryContent({ 
  salesData, 
  recentOrders, 
  monthlyStats, 
  topProducts 
}: SalesHistoryContentProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const totalEarnings = salesData._sum.amount || 0;
  const totalSales = salesData._count.id;

  // Calculate this month's performance
  const currentMonth = format(new Date(), 'yyyy-MM');
  const thisMonthStats = monthlyStats.find(stat => stat.month === currentMonth);
  const thisMonthEarnings = thisMonthStats?.total_sales || 0;
  const thisMonthSales = Number(thisMonthStats?.order_count || 0);

  // Calculate average order value
  const averageOrderValue = totalSales > 0 ? totalEarnings / totalSales : 0;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      PAID: { variant: 'default' as const, label: 'Paid' },
      SHIPPED: { variant: 'default' as const, label: 'Shipped' },
      DELIVERED: { variant: 'default' as const, label: 'Delivered' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
      DISPUTED: { variant: 'destructive' as const, label: 'Disputed' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      variant: 'secondary' as const, 
      label: status 
    };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalEarnings / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(Number(thisMonthEarnings) / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthSales} sale{thisMonthSales !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(averageOrderValue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sales</TabsTrigger>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="top-products">Top Products</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
        </TabsList>

        {/* All Sales Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Sales History</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your sales history will appear here once you make your first sale.
                  </p>
                  <Button asChild>
                    <Link href="/selling/listings">
                      View Your Listings
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <Image
                                src={order.product.images[0]?.imageUrl || '/placeholder.png'}
                                alt={order.product.title}
                                fill
                                className="object-cover rounded-md"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{order.product.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.product.status}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={order.buyer.imageUrl || undefined} />
                              <AvatarFallback>
                                {order.buyer.firstName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {order.buyer.firstName} {order.buyer.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${(order.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/buying/orders/${order.id}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Orders Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={order.product.images[0]?.imageUrl || '/placeholder.png'}
                        alt={order.product.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{order.product.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Order #{order.id.slice(-8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${(order.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM d')}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="top-products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No top products yet</h3>
                  <p className="text-muted-foreground">
                    Keep selling to see your best performers here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((item, index) => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      {item.product && (
                        <>
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={item.product.images[0]?.imageUrl || '/placeholder.png'}
                              alt={item.product.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {item._count.id} sale{item._count.id !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${((item._sum.amount || 0) / 100).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total earned
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Breakdown Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyStats.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No monthly data yet</h3>
                  <p className="text-muted-foreground">
                    Monthly breakdown will appear as you make sales.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Sales Count</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg. Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats.map((stat) => {
                      const orderCount = Number(stat.order_count);
                      const totalSales = Number(stat.total_sales);
                      const avgOrder = orderCount > 0 ? totalSales / orderCount : 0;
                      return (
                        <TableRow key={stat.month}>
                          <TableCell>
                            {format(new Date(stat.month + '-01'), 'MMMM yyyy')}
                          </TableCell>
                          <TableCell>{orderCount}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${(totalSales / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${(avgOrder / 100).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}