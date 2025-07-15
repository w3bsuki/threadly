'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, ShoppingCart, Repeat, Target } from 'lucide-react';

interface BehaviorInsightsProps {
  insights: {
    topCategories: Array<{ name: string; interactions: number }>;
    avgTimeToPurchase: number;
    conversionRate: number;
    repeatPurchaseRate: number;
  };
}

export function BehaviorInsights({ insights }: BehaviorInsightsProps) {
  const formatTime = (hours: number) => {
    if (hours < 24) return `${Math.round(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  const maxInteractions = Math.max(...insights.topCategories.map(c => c.interactions));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Purchase</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(insights.avgTimeToPurchase)}
            </div>
            <p className="text-xs text-muted-foreground">
              From first view to purchase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(insights.conversionRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Visitors who make a purchase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Purchase Rate</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(insights.repeatPurchaseRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Customers who buy again
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Interactions */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.topCategories.map((category, index) => {
              const percentage = (category.interactions / maxInteractions) * 100;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.interactions} interactions
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Interactions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category Interaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.topCategories} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                          <div className="font-medium">{payload[0].payload.name}</div>
                          <div className="text-sm text-gray-600">
                            {payload[0].value} interactions
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="interactions" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Behavior Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Purchase Behavior</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {(insights.conversionRate * 100).toFixed(1)}% of visitors convert to customers</li>
                  <li>• Average decision time: {formatTime(insights.avgTimeToPurchase)}</li>
                  <li>• {(insights.repeatPurchaseRate * 100).toFixed(1)}% become repeat customers</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Engagement Patterns</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Most popular: {insights.topCategories[0]?.name}</li>
                  <li>• {insights.topCategories.length} categories actively browsed</li>
                  <li>• High engagement in top 3 categories</li>
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Optimization Suggestions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {insights.conversionRate < 0.02 && (
                  <li>• Consider improving product descriptions and images to boost conversion rate</li>
                )}
                {insights.avgTimeToPurchase > 168 && (
                  <li>• Decision time is long - consider adding urgency elements or limited-time offers</li>
                )}
                {insights.repeatPurchaseRate < 0.3 && (
                  <li>• Focus on customer retention strategies to increase repeat purchases</li>
                )}
                <li>• Expand inventory in {insights.topCategories[0]?.name} - your most popular category</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}