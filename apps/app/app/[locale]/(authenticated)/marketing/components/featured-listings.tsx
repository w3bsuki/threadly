'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Progress } from '@repo/design-system/components';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@repo/design-system/components';
import { 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Calendar,
  Plus
} from 'lucide-react';

interface FeaturedListingsProps {
  userId: string;
}

export function FeaturedListings({ userId }: FeaturedListingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock data for demo
  const featuredProducts = [
    {
      id: '1',
      productId: 'prod_123',
      title: 'Vintage Denim Jacket',
      imageUrl: '/api/placeholder/200/200',
      featuredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      impressions: 1234,
      clicks: 89,
      position: 1,
    },
    {
      id: '2',
      productId: 'prod_456',
      title: 'Designer Handbag',
      imageUrl: '/api/placeholder/200/200',
      featuredUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      impressions: 856,
      clicks: 45,
      position: 2,
    },
  ];

  const availableProducts = [
    {
      id: 'prod_789',
      title: 'Leather Boots',
      price: 120,
      views: 234,
    },
    {
      id: 'prod_012',
      title: 'Summer Dress',
      price: 65,
      views: 189,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Featured Listings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Boost visibility with premium placement
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Feature Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select Product to Feature</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Featured products get premium placement in search results and category pages
              </div>
              
              {/* Available Products */}
              <div className="space-y-2">
                {availableProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:border-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{product.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${product.price} • {product.views} views
                          </p>
                        </div>
                        <Button size="sm">
                          Feature for $5/week
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Featured Products Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {featuredProducts.map((product) => {
          const ctr = product.impressions > 0 
            ? (product.clicks / product.impressions) * 100 
            : 0;
          const daysLeft = Math.ceil(
            (product.featuredUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          return (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-base">{product.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">Position #{product.position}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {daysLeft} days left
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Eye className="h-3 w-3" />
                      <span className="text-xs">Views</span>
                    </div>
                    <p className="text-xl font-bold">{product.impressions}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <MousePointer className="h-3 w-3" />
                      <span className="text-xs">Clicks</span>
                    </div>
                    <p className="text-xl font-bold">{product.clicks}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">CTR</span>
                    </div>
                    <p className="text-xl font-bold">{ctr.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Performance Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Performance</span>
                    <span className="font-medium">
                      {ctr > 5 ? 'Excellent' : ctr > 3 ? 'Good' : 'Average'}
                    </span>
                  </div>
                  <Progress value={Math.min(ctr * 10, 100)} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Extend
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Featured Listings Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Featured products appear at the top of search results and category pages</p>
          <p>• Get up to 5x more views and 3x more clicks than regular listings</p>
          <p>• Track performance with detailed analytics and insights</p>
          <p>• Starting at just $5 per week with guaranteed impressions</p>
        </CardContent>
      </Card>
    </div>
  );
}