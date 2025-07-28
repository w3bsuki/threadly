'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components';
import {
  CursorPagination,
  useCursorPagination,
} from '@repo/design-system/components/marketplace';
import type { CursorPaginationResult } from '@repo/design-system/lib/pagination';
import { decimalToNumber } from '@repo/utils';
import { Archive, RefreshCw, Search, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useState } from 'react';
import { bulkUpdateProducts } from './actions';
import { ProductActions } from './product-actions';

interface ProductWithDetails {
  id: string;
  title: string;
  description: string | null;
  price: number;
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
  paginatedData: CursorPaginationResult<ProductWithDetails>;
  search: string;
  statusFilter: string;
}

function ProductTable({ products }: { products: ProductWithDetails[] }) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, productId]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
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
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-muted/50 p-4">
          <span className="font-medium text-sm">
            {selectedProducts.length} products selected
          </span>
          <div className="flex gap-2">
            <Button
              disabled={isUpdating}
              onClick={() => handleBulkAction('remove')}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remove
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => handleBulkAction('archive')}
              size="sm"
              variant="outline"
            >
              <Archive className="mr-1 h-4 w-4" />
              Archive
            </Button>
            <Button
              disabled={isUpdating}
              onClick={() => handleBulkAction('restore')}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Restore
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="w-12 p-2 text-left font-medium">
                <Checkbox
                  checked={
                    selectedProducts.length === products.length &&
                    products.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-2 text-left font-medium">Product</th>
              <th className="p-2 text-left font-medium">Seller</th>
              <th className="p-2 text-left font-medium">Category</th>
              <th className="p-2 text-left font-medium">Price</th>
              <th className="p-2 text-left font-medium">Stats</th>
              <th className="p-2 text-left font-medium">Status</th>
              <th className="p-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr className="border-b hover:bg-muted/50" key={product.id}>
                <td className="p-2">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product.id, checked as boolean)
                    }
                  />
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <Image
                        alt={product.title}
                        className="h-16 w-16 rounded-[var(--radius-lg)] object-cover"
                        height={64}
                        priority={index < 5}
                        sizes="64px"
                        src={product.images[0].imageUrl}
                        width={64}
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-muted">
                        No image
                      </div>
                    )}
                    <div>
                      <p className="line-clamp-1 font-medium">
                        {product.title}
                      </p>
                      <p className="line-clamp-1 text-muted-foreground text-sm">
                        {product.description || 'No description'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-2">
                  <div>
                    <p className="font-medium text-sm">
                      {product.seller.firstName || ''}{' '}
                      {product.seller.lastName || ''}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {product.seller.email}
                    </p>
                  </div>
                </td>
                <td className="p-2">
                  <Badge variant="outline">{product.category.name}</Badge>
                </td>
                <td className="p-2">
                  <p className="font-medium">
                    ${(decimalToNumber(product.price) / 100).toFixed(2)}
                  </p>
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
                  <Badge
                    variant={
                      product.status === 'AVAILABLE'
                        ? 'default'
                        : product.status === 'SOLD'
                          ? 'secondary'
                          : product.status === 'REMOVED'
                            ? 'destructive'
                            : 'outline'
                    }
                  >
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

export function AdminProductsClient({
  paginatedData,
  search,
  statusFilter,
}: AdminProductsClientProps): React.JSX.Element {
  const [products, setProducts] = useState(paginatedData.items);
  const { state, updateState } = useCursorPagination({
    cursor: paginatedData.nextCursor,
    hasNextPage: paginatedData.hasNextPage,
    totalCount: paginatedData.totalCount,
    isLoading: false,
  });

  const loadMore = useCallback(async () => {
    if (!state.hasNextPage || state.isLoading) return;

    updateState({ isLoading: true });

    try {
      const params = new URLSearchParams();
      if (state.cursor) params.set('cursor', state.cursor);
      params.set('limit', '20');
      if (search) params.set('q', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();

      setProducts((prev) => [...prev, ...data.items]);
      updateState({
        cursor: data.nextCursor,
        hasNextPage: data.hasNextPage,
        isLoading: false,
      });
    } catch (error) {
      updateState({ isLoading: false });
    }
  }, [
    state.cursor,
    state.hasNextPage,
    state.isLoading,
    search,
    statusFilter,
    updateState,
  ]);

  // Calculate stats from current page products only (admin needs total stats in future)
  const statusStats = {
    total: paginatedData.totalCount || products.length,
    available: products.filter((p) => p.status === 'AVAILABLE').length,
    sold: products.filter((p) => p.status === 'SOLD').length,
    removed: products.filter((p) => p.status === 'REMOVED').length,
    reserved: products.filter((p) => p.status === 'RESERVED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-3xl">Product Management</h1>
        <p className="mt-2 text-muted-foreground">
          Review and moderate product listings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{statusStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {statusStats.available}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-blue-600">
              {statusStats.sold}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-yellow-600">
              {statusStats.reserved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-medium text-sm">Removed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">
              {statusStats.removed}
            </div>
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
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                <Input
                  className="w-[300px] pl-10"
                  name="q"
                  placeholder="Search products..."
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

      <CursorPagination
        currentCount={products.length}
        loadMoreText="Load More Products"
        onLoadMore={loadMore}
        showStats={true}
        state={state}
      />
    </div>
  );
}
