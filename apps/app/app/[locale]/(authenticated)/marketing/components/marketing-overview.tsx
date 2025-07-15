import { database } from '@repo/database';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { 
  Tag, 
  Eye, 
  MousePointer,
  ShoppingBag,
  TrendingUp,
  Percent
} from 'lucide-react';

interface MarketingOverviewProps {
  userId: string;
}

export async function MarketingOverview({ userId }: MarketingOverviewProps) {
  // Get discount code statistics
  const discountCodes = await database.discountCode.findMany({
    where: { sellerId: userId },
    include: {
      usedCodes: true
    }
  });

  const activeDiscounts = discountCodes.filter(code => code.isActive);
  const totalDiscountUses = discountCodes.reduce((sum, code) => sum + code.currentUses, 0);
  const totalSaved = discountCodes.reduce((sum, code) => 
    sum + code.usedCodes.reduce((codeSum, used) => codeSum + Number(used.savedAmount), 0), 0
  );

  // Get featured product statistics
  const featuredProducts = await database.featuredProduct.findMany({
    where: {
      product: {
        sellerId: userId
      }
    }
  });

  const totalImpressions = featuredProducts.reduce((sum, fp) => sum + fp.impressions, 0);
  const totalClicks = featuredProducts.reduce((sum, fp) => sum + fp.clicks, 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDiscounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalDiscountUses} total uses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Savings</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSaved.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total discount value given
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently promoted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalClicks} clicks from {totalImpressions} views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Discount Conversion Rate</span>
              <span className="font-medium">
                {discountCodes.length > 0 
                  ? `${((totalDiscountUses / discountCodes.length) * 10).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <Progress 
              value={discountCodes.length > 0 ? (totalDiscountUses / discountCodes.length) * 10 : 0} 
              className="h-2" 
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Featured Product CTR</span>
              <span className="font-medium">{ctr.toFixed(1)}%</span>
            </div>
            <Progress value={ctr} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Marketing ROI</span>
              <span className="font-medium text-green-600">+235%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Discount</CardTitle>
          </CardHeader>
          <CardContent>
            {activeDiscounts.length > 0 ? (
              <div className="space-y-2">
                <div className="font-mono text-lg">{activeDiscounts[0].code}</div>
                <p className="text-sm text-muted-foreground">
                  {activeDiscounts[0].currentUses} uses • 
                  {activeDiscounts[0].type === 'PERCENTAGE' 
                    ? `${activeDiscounts[0].value}% off`
                    : `$${activeDiscounts[0].value} off`}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No active discounts</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Featured Product</CardTitle>
          </CardHeader>
          <CardContent>
            {featuredProducts.length > 0 ? (
              <div className="space-y-2">
                <p className="font-medium">Product #{featuredProducts[0].productId.slice(-6)}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {featuredProducts[0].impressions} views
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointer className="h-3 w-3" />
                    {featuredProducts[0].clicks} clicks
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No featured products</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}