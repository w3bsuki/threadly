'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Avatar, AvatarFallback } from '@repo/design-system/components';
import { Crown, Star, TrendingUp } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  totalSpent: number;
  ordersCount: number;
  lastPurchase: string;
  lifetimeValue: number;
}

interface CustomerLifetimeValueProps {
  customers: Customer[];
}

export function CustomerLifetimeValue({ customers }: CustomerLifetimeValueProps) {
  const topCustomers = customers.slice(0, 10);
  const averageLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length;

  const getCustomerTier = (ltv: number) => {
    if (ltv >= averageLTV * 3) return { tier: 'VIP', color: 'bg-purple-100 text-purple-800', icon: Crown };
    if (ltv >= averageLTV * 2) return { tier: 'Premium', color: 'bg-yellow-100 text-yellow-800', icon: Star };
    if (ltv >= averageLTV) return { tier: 'Valued', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
    return { tier: 'Standard', color: 'bg-gray-100 text-gray-800', icon: TrendingUp };
  };

  return (
    <div className="space-y-6">
      {/* LTV Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageLTV.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per customer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Customer LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.max(...customers.map(c => c.lifetimeValue)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Highest spender</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">VIP Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.lifetimeValue >= averageLTV * 3).length}
            </div>
            <p className="text-xs text-muted-foreground">High-value customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Lifetime Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => {
              const tierInfo = getCustomerTier(customer.lifetimeValue);
              const TierIcon = tierInfo.icon;
              
              return (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-orange-400 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        <Badge className={`text-xs ${tierInfo.color}`}>
                          <TierIcon className="h-3 w-3 mr-1" />
                          {tierInfo.tier}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.ordersCount} orders • Last purchase: {new Date(customer.lastPurchase).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold">${customer.lifetimeValue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      ${customer.totalSpent.toFixed(2)} total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* LTV Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Value Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries({
              'VIP (3x+ avg)': customers.filter(c => c.lifetimeValue >= averageLTV * 3).length,
              'Premium (2x+ avg)': customers.filter(c => c.lifetimeValue >= averageLTV * 2 && c.lifetimeValue < averageLTV * 3).length,
              'Valued (1x+ avg)': customers.filter(c => c.lifetimeValue >= averageLTV && c.lifetimeValue < averageLTV * 2).length,
              'Standard': customers.filter(c => c.lifetimeValue < averageLTV).length,
            }).map(([tier, count]) => (
              <div key={tier} className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{tier}</div>
                <div className="text-xs text-muted-foreground">
                  {((count / customers.length) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}