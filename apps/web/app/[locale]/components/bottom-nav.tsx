'use client';

import { Button } from '@repo/design-system/components';
import { Sheet, SheetContent, SheetTrigger } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Search, SlidersHorizontal, Plus, Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useCartStore } from '@/lib/stores/cart-store';

export const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const items = useCartStore((state) => state.items);
  const [showFilters, setShowFilters] = useState(false);
  const cartItemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  // Filter states from URL
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('gender') || '');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const isActive = (path: string) => pathname === path;

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    if (selectedSort && selectedSort !== 'newest') params.set('sort', selectedSort);
    if (selectedCategory) params.set('gender', selectedCategory);
    if (selectedCondition) params.set('condition', selectedCondition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    router.push(`/products?${params.toString()}`);
    setShowFilters(false);
  }, [selectedSort, selectedCategory, selectedCondition, minPrice, maxPrice, router]);

  const clearFilters = useCallback(() => {
    setSelectedSort('newest');
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedSizes([]);
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
    setShowFilters(false);
  }, [router]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        {/* Filters */}
        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetTrigger asChild>
            <button 
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                showFilters ? 'text-black' : 'text-gray-500'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">Filters</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6">Filters</h2>
              
              {/* Quick Filters */}
              <div className="space-y-6">
                {/* Sort By */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Sort By</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={selectedSort === 'newest' ? 'default' : 'outline'} 
                      size="sm" 
                      className="justify-start"
                      onClick={() => setSelectedSort('newest')}
                    >
                      Newest First
                    </Button>
                    <Button 
                      variant={selectedSort === 'price-asc' ? 'default' : 'outline'} 
                      size="sm" 
                      className="justify-start"
                      onClick={() => setSelectedSort('price-asc')}
                    >
                      Price: Low to High
                    </Button>
                    <Button 
                      variant={selectedSort === 'price-desc' ? 'default' : 'outline'} 
                      size="sm" 
                      className="justify-start"
                      onClick={() => setSelectedSort('price-desc')}
                    >
                      Price: High to Low
                    </Button>
                    <Button 
                      variant={selectedSort === 'popular' ? 'default' : 'outline'} 
                      size="sm" 
                      className="justify-start"
                      onClick={() => setSelectedSort('popular')}
                    >
                      Most Popular
                    </Button>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {['women', 'men', 'kids'].map(cat => (
                      <Badge 
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'secondary'} 
                        className="cursor-pointer hover:bg-gray-200 capitalize"
                        onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Condition</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'NEW_WITH_TAGS', label: 'New with tags' },
                      { value: 'LIKE_NEW', label: 'Like new' },
                      { value: 'GOOD', label: 'Good' },
                      { value: 'FAIR', label: 'Fair' }
                    ].map(condition => (
                      <Button 
                        key={condition.value}
                        variant={selectedCondition === condition.value ? 'default' : 'outline'} 
                        size="sm" 
                        className="justify-start"
                        onClick={() => setSelectedCondition(selectedCondition === condition.value ? '' : condition.value)}
                      >
                        {condition.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Size</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'].map(size => (
                      <Button 
                        key={size}
                        variant="outline" 
                        size="sm"
                        className="h-10"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Price Range</h3>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Filters */}
              <div className="mt-8 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
                <Button 
                  className="flex-1 bg-black text-white hover:bg-gray-800"
                  onClick={applyFilters}
                >
                  Show Results
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Buy/Browse */}
        <Link 
          href="/products"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            pathname.includes('/products') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px] font-medium">Buy</span>
        </Link>

        {/* Sell */}
        <Link 
          href="/selling/new"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            pathname.includes('/selling') ? 'text-white bg-black' : 'text-white bg-black'
          } rounded-lg mx-2 my-1`}
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-medium">Sell</span>
        </Link>

        {/* Wishlist */}
        <Link 
          href="/favorites"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            pathname.includes('/favorites') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>

        {/* Cart */}
        <Link 
          href="/cart"
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            pathname.includes('/cart') ? 'text-black' : 'text-gray-500'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 right-3 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
              {cartItemCount}
            </span>
          )}
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
      </div>
    </div>
  );
};