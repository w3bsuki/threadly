'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components';
import {
  CursorPagination,
  useCursorPagination,
} from '@repo/ui/components/marketplace';
import type { CursorPaginationResult } from '@repo/ui/lib/pagination';
import { decimalToNumber } from '@repo/utils';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Package,
  Search,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import type { BulkOperationType } from '@/lib/database-types';

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  brand: string | null;
  size: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  images: Array<{ imageUrl: string; alt?: string | null }>;
  category: { id: string; name: string };
  _count: { orders: number; favorites: number };
}

interface AdvancedInventoryTableProps {
  initialData: CursorPaginationResult<Product>;
  userId: string;
  locale: string;
  dictionary: { [key: string]: string };
  categories: Array<{ id: string; name: string }>;
}

type ViewMode = 'grid' | 'table';
type SortField = 'title' | 'price' | 'createdAt' | 'views' | 'status';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  search: string;
  status: string;
  category: string;
  condition: string;
  priceMin: string;
  priceMax: string;
  dateRange: string;
}

export function AdvancedInventoryTable({
  initialData,
  userId,
  locale,
  dictionary,
  categories,
}: AdvancedInventoryTableProps) {
  const [products, setProducts] = useState(initialData.items);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    category: '',
    condition: '',
    priceMin: '',
    priceMax: '',
    dateRange: '',
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { state, updateState } = useCursorPagination({
    cursor: initialData.nextCursor,
    hasNextPage: initialData.hasNextPage,
    totalCount: initialData.totalCount,
    isLoading: false,
  });

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchLower) ||
          product.brand?.toLowerCase().includes(searchLower) ||
          product.category.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(
        (product) => product.status === filters.status
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category.id === filters.category
      );
    }

    // Apply condition filter
    if (filters.condition) {
      filtered = filtered.filter(
        (product) => product.condition === filters.condition
      );
    }

    // Apply price range filter
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter((product) => {
        const price = decimalToNumber(product.price) / 100;
        const min = filters.priceMin ? Number.parseFloat(filters.priceMin) : 0;
        const max = filters.priceMax
          ? Number.parseFloat(filters.priceMax)
          : Number.POSITIVE_INFINITY;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = decimalToNumber(a.price) - decimalToNumber(b.price);
          break;
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredAndSortedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredAndSortedProducts.map((p) => p.id)));
    }
  };

  const handleBulkAction = async (
    operation: BulkOperationType,
    data: Record<string, unknown>
  ) => {
    if (selectedProducts.size === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/seller/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          operation,
          data,
        }),
      });

      if (response.ok) {
        // Refresh the data
        window.location.reload(); // Simple approach - could be optimized
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
      setSelectedProducts(new Set());
      setShowBulkActions(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'SOLD':
        return 'bg-secondary text-secondary-foreground dark:bg-secondary-foreground dark:text-muted-foreground';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'REMOVED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-secondary text-secondary-foreground dark:bg-secondary-foreground dark:text-muted-foreground';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'NEW_WITH_TAGS':
        return 'New with tags';
      case 'NEW_WITHOUT_TAGS':
        return 'New without tags';
      case 'VERY_GOOD':
        return 'Very good';
      case 'GOOD':
        return 'Good';
      case 'SATISFACTORY':
        return 'Satisfactory';
      default:
        return condition;
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      className="h-auto justify-start p-0 font-semibold"
      onClick={() => handleSort(field)}
      variant="ghost"
    >
      {children}
      {sortField === field &&
        (sortDirection === 'asc' ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        ))}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-80">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Search products..."
              value={filters.search}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4">
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                    value={filters.status}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="SOLD">Sold</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                      <SelectItem value="REMOVED">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, category: value }))
                    }
                    value={filters.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Min Price</Label>
                    <Input
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceMin: e.target.value,
                        }))
                      }
                      placeholder="0"
                      type="number"
                      value={filters.priceMin}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Max Price</Label>
                    <Input
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          priceMax: e.target.value,
                        }))
                      }
                      placeholder="999"
                      type="number"
                      value={filters.priceMax}
                    />
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedProducts.size > 0 && (
            <Dialog onOpenChange={setShowBulkActions} open={showBulkActions}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Actions ({selectedProducts.size})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    disabled={isLoading}
                    onClick={() =>
                      handleBulkAction('STATUS_CHANGE', { status: 'AVAILABLE' })
                    }
                    variant="outline"
                  >
                    Mark as Available
                  </Button>
                  <Button
                    className="w-full justify-start"
                    disabled={isLoading}
                    onClick={() =>
                      handleBulkAction('STATUS_CHANGE', { status: 'REMOVED' })
                    }
                    variant="outline"
                  >
                    Remove from Sale
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        Update Prices
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Prices</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>New Price ($)</Label>
                          <Input
                            id="bulk-price"
                            placeholder="Enter new price"
                            type="number"
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            const priceInput = document.getElementById(
                              'bulk-price'
                            ) as HTMLInputElement;
                            const price = Number.parseFloat(priceInput.value);
                            if (price > 0) {
                              handleBulkAction('PRICE_UPDATE', {
                                price: price * 100,
                              });
                            }
                          }}
                        >
                          Update Prices
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <div className="flex rounded-[var(--radius-md)] border">
            <Button
              onClick={() => setViewMode('grid')}
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode('table')}
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProducts.size ===
                          filteredAndSortedProducts.length &&
                        filteredAndSortedProducts.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>
                    <SortButton field="title">Product</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="price">Price</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="status">Status</SortButton>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <SortButton field="views">Views</SortButton>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <SortButton field="createdAt">Created</SortButton>
                  </TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-[var(--radius-md)]">
                        {product.images[0] ? (
                          <Image
                            alt={product.title}
                            className="object-cover"
                            fill
                            sizes="48px"
                            src={product.images[0].imageUrl}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="line-clamp-1 font-medium">
                          {product.title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {getConditionText(product.condition)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">
                        ${(decimalToNumber(product.price) / 100).toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.category.name}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.views}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/selling/listings/${product.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/product/${product.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {filteredAndSortedProducts.length > 0 && (
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>
                {selectedProducts.size > 0 &&
                  `${selectedProducts.size} selected • `}
                Showing {filteredAndSortedProducts.length} products
              </span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedProducts.map((product) => (
              <Card className="relative overflow-hidden" key={product.id}>
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    className="border-border bg-background/90"
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                </div>

                <div className="relative aspect-square">
                  {product.images[0] ? (
                    <Image
                      alt={product.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      src={product.images[0].imageUrl}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>

                  <div className="absolute right-2 bottom-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="h-8 w-8 bg-background/80 hover:bg-background/90"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/selling/listings/${product.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/product/${product.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="line-clamp-1 font-semibold">
                      {product.title}
                    </h3>
                    <p className="font-bold text-2xl">
                      ${(decimalToNumber(product.price) / 100).toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between text-muted-foreground text-sm">
                      <span>{getConditionText(product.condition)}</span>
                      <span>{product.category.name}</span>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2 text-muted-foreground text-xs">
                      <span>
                        {product._count.favorites} saves • {product.views} views
                      </span>
                      <span>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredAndSortedProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-lg">No products found</h3>
              <p className="mb-4 text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() =>
                  setFilters({
                    search: '',
                    status: '',
                    category: '',
                    condition: '',
                    priceMin: '',
                    priceMax: '',
                    dateRange: '',
                  })
                }
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
