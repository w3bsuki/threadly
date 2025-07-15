'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Button, 
  Input, 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@repo/design-system/components';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Grid3X3, 
  List,
  ChevronDown,
  Check,
  X,
  DollarSign,
  Package,
  Calendar,
  ChevronUp
} from 'lucide-react';
import { decimalToNumber } from '@repo/utils';
import { CursorPagination, useCursorPagination } from '@repo/design-system/components/marketplace';
import type { CursorPaginationResult } from '@repo/design-system/lib/pagination';
import { BulkOperationType } from '@/lib/database-types';

interface Product {
  id: string;
  title: string;
  price: any;
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
  dictionary: any;
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
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
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
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.category.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category.id === filters.category);
    }

    // Apply condition filter
    if (filters.condition) {
      filtered = filtered.filter(product => product.condition === filters.condition);
    }

    // Apply price range filter
    if (filters.priceMin || filters.priceMax) {
      filtered = filtered.filter(product => {
        const price = decimalToNumber(product.price) / 100;
        const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
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
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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
      setSelectedProducts(new Set(filteredAndSortedProducts.map(p => p.id)));
    }
  };

  const handleBulkAction = async (operation: BulkOperationType, data: any) => {
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
      console.error('Bulk operation failed:', error);
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
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'REMOVED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'NEW_WITH_TAGS': return 'New with tags';
      case 'NEW_WITHOUT_TAGS': return 'New without tags';
      case 'VERY_GOOD': return 'Very good';
      case 'GOOD': return 'Good';
      case 'SATISFACTORY': return 'Satisfactory';
      default: return condition;
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-semibold justify-start"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-4">
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
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
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map(category => (
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
                      type="number"
                      placeholder="0"
                      value={filters.priceMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Max Price</Label>
                    <Input
                      type="number"
                      placeholder="999"
                      value={filters.priceMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {selectedProducts.size > 0 && (
            <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions ({selectedProducts.size})
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk Actions</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('STATUS_CHANGE', { status: 'AVAILABLE' })}
                    disabled={isLoading}
                  >
                    Mark as Available
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleBulkAction('STATUS_CHANGE', { status: 'REMOVED' })}
                    disabled={isLoading}
                  >
                    Remove from Sale
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
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
                          <Input type="number" placeholder="Enter new price" id="bulk-price" />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            const priceInput = document.getElementById('bulk-price') as HTMLInputElement;
                            const price = parseFloat(priceInput.value);
                            if (price > 0) {
                              handleBulkAction('PRICE_UPDATE', { price: price * 100 });
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
          
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
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
                      checked={selectedProducts.size === filteredAndSortedProducts.length && filteredAndSortedProducts.length > 0}
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
                  <TableHead className="hidden md:table-cell">Category</TableHead>
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
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].imageUrl}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">{product.title}</p>
                        <p className="text-sm text-muted-foreground">
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
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/selling/listings/${product.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/product/${product.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
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
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {selectedProducts.size > 0 && `${selectedProducts.size} selected • `}
                Showing {filteredAndSortedProducts.length} products
              </span>
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden relative">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                    className="bg-white/90 border-gray-300"
                  />
                </div>
                
                <div className="aspect-square relative">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0].imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white/90">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/selling/listings/${product.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/product/${product.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                    <p className="text-2xl font-bold">
                      ${(decimalToNumber(product.price) / 100).toFixed(2)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{getConditionText(product.condition)}</span>
                      <span>{product.category.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
                      <span>{product._count.favorites} saves • {product.views} views</span>
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
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
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  category: '',
                  condition: '',
                  priceMin: '',
                  priceMax: '',
                  dateRange: '',
                })}
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