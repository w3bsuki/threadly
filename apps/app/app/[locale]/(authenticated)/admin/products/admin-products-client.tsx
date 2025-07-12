'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Checkbox } from '@repo/design-system/components';
import { 
  Search,
  Trash2,
  Archive,
  RefreshCw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components';
import Image from 'next/image';
import { ProductActions } from './product-actions';
import { bulkUpdateProducts } from './actions';
import { useRouter } from 'next/navigation';
import { decimalToNumber } from '@repo/utils';

interface ProductWithDetails {
  id: string;
  title: string;
  description: string | null;
  price: any;
  status: string;
  createdAt: Date;
  views: number;
  sellerId: string;
  seller: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  category: {
    name: string;
  };
  images: Array<{
    imageUrl: string;
  }>;
  _count: {
    favorites: number;
    orders: number;
  };
}

interface AdminProductsClientProps {
  products: ProductWithDetails[];
}

function ProductTable({ products }: { products: ProductWithDetails[] }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async (action: 'remove' | 'restore' | 'archive') => {
    if (selectedProducts.length === 0) return;
    
    setIsUpdating(true);
    try {
      await bulkUpdateProducts({
        productIds: selectedProducts,
        action,
      });
      setSelectedProducts([]);
      // Use router.refresh() instead of window.location.reload()
      router.refresh();
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedProducts.length} products selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('remove')}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('archive')}
              disabled={isUpdating}
            >
              <Archive className="h-4 w-4 mr-1" />
              Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('restore')}
              disabled={isUpdating}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Restore
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium w-12">
                <Checkbox
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-2 font-medium">Product</th>
              <th className="text-left p-2 font-medium">Seller</th>
              <th className="text-left p-2 font-medium">Category</th>
              <th className="text-left p-2 font-medium">Price</th>
              <th className="text-left p-2 font-medium">Stats</th>
              <th className="text-left p-2 font-medium">Status</th>
              <th className="text-right p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-muted/50">
                <td className="p-2">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <Image 
                        src={product.images[0].imageUrl} 
                        alt={product.title}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                        No image
                      </div>
                    )}
                    <div>
                      <p className="font-medium line-clamp-1">{product.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <div>
                    <p className="text-sm font-medium">
                      {product.seller.firstName || ''} {product.seller.lastName || ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.seller.email}
                    </p>
                  </div>
                </td>
                <td className="p-2">
                  <Badge variant="outline">
                    {product.category.name}
                  </Badge>
                </td>
                <td className="p-2">
                  <p className="font-medium">${(decimalToNumber(product.price) / 100).toFixed(2)}</p>
                </td>
                <td className="p-2">
                  <div className="text-sm">
                    <p>{product._count.favorites} favorites</p>
                    <p className="text-muted-foreground">
                      {product._count.orders} orders • {product.views} views
                    </p>
                  </div>
                </td>
                <td className="p-2">
                  <Badge variant={
                    product.status === 'AVAILABLE' ? 'default' : 
                    product.status === 'SOLD' ? 'secondary' : 
                    product.status === 'REMOVED' ? 'destructive' :
                    'outline'
                  }>
                    {product.status}
                  </Badge>
                </td>
                <td className="p-2 text-right">
                  <ProductActions product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminProductsClient({ products }: AdminProductsClientProps): React.ReactElement {
  // Calculate stats from products
  const statusStats = {
    total: products.length,
    available: products.filter(p => p.status === 'AVAILABLE').length,
    sold: products.filter(p => p.status === 'SOLD').length,
    removed: products.filter(p => p.status === 'REMOVED').length,
    reserved: products.filter(p => p.status === 'RESERVED').length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate product listings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusStats.available}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statusStats.sold}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusStats.reserved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusStats.removed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products</CardTitle>
            <div className="flex items-center gap-2">
              <form className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  name="q"
                  className="pl-10 w-[300px]"
                />
              </form>
              
              <form>
                <Select name="status">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
              </form>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}