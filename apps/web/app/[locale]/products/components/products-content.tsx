import { database } from "@repo/database";
import type { Prisma } from "@repo/database";
import type { Dictionary } from "@repo/internationalization";
import { ProductGrid } from "./product-grid";
import { ProductFilters } from "./product-filters";
import { CollapsibleFilters } from "./collapsible-filters";
import { ProductFiltersMobile } from "./product-filters-mobile";
import { ProductSort } from "./product-sort";
import { QuickFilters } from "./quick-filters";
import { Pagination } from "./pagination";
import { PromotionalBanner } from "./promotional-banner";
import { LayoutSwitcher, ViewMode } from "./layout-switcher";
import { ProductListView } from "./product-list-view";
import { EnhancedHeader } from "./enhanced-header";
import { ProductsClientWrapper } from "./products-client-wrapper";
import { Separator } from '@repo/design-system/components';
import { SlidersHorizontal } from 'lucide-react';
import { withDatabaseErrorHandling } from '@/lib/utils/error-handling';

const ITEMS_PER_PAGE = 12;

interface ProductsContentProps {
  searchParams: {
    category?: string;
    gender?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
    page?: string;
  };
  dictionary: Dictionary;
}

export async function ProductsContent({ searchParams, dictionary }: ProductsContentProps) {
  const page = parseInt(searchParams.page || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause for filtering
  const where: Prisma.ProductWhereInput = {
    status: "AVAILABLE",
  };

  // Handle gender filtering by category name
  if (searchParams.gender) {
    where.category = {
      OR: [
        { name: { contains: searchParams.gender, mode: 'insensitive' } },
        { slug: { contains: searchParams.gender, mode: 'insensitive' } }
      ]
    };
  }

  // Handle specific category within gender
  if (searchParams.category) {
    if (searchParams.gender) {
      // Refine the category search to be more specific
      where.category = {
        AND: [
          {
            OR: [
              { name: { contains: searchParams.gender, mode: 'insensitive' } },
              { slug: { contains: searchParams.gender, mode: 'insensitive' } }
            ]
          },
          {
            OR: [
              { name: { contains: searchParams.category, mode: 'insensitive' } },
              { slug: { contains: searchParams.category, mode: 'insensitive' } }
            ]
          }
        ]
      };
    } else {
      where.category = {
        OR: [
          { name: { contains: searchParams.category, mode: 'insensitive' } },
          { slug: { contains: searchParams.category, mode: 'insensitive' } }
        ]
      };
    }
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      where.price.gte = parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseFloat(searchParams.maxPrice);
    }
  }

  if (searchParams.condition) {
    where.condition = searchParams.condition as any; // Type assertion for condition enum
  }

  // Build orderBy for sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" }; // default to newest
  
  if (searchParams.sort === "price-asc") {
    orderBy = { price: "asc" };
  } else if (searchParams.sort === "price-desc") {
    orderBy = { price: "desc" };
  } else if (searchParams.sort === "popular") {
    orderBy = { views: "desc" };
  }

  // Fetch products with pagination and error handling
  const [products, totalCount] = await Promise.all([
    withDatabaseErrorHandling(
      'fetchProducts',
      () => database.product.findMany({
        where,
        orderBy,
        skip,
        take: ITEMS_PER_PAGE,
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      }),
      {
        where,
        orderBy,
        page,
        itemsPerPage: ITEMS_PER_PAGE,
      }
    ),
    withDatabaseErrorHandling(
      'countProducts',
      () => database.product.count({ where }),
      { where }
    ),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Transform products to match ProductGrid interface
  const transformedProducts = products.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    condition: product.condition,
    category: product.category.name,
    brand: product.brand || undefined,
    images: product.images.map(image => ({
      id: image.id,
      imageUrl: image.imageUrl,
      alt: image.alt || undefined,
      displayOrder: image.displayOrder,
    })),
    seller: {
      id: product.seller.id,
      firstName: product.seller.firstName || "Anonymous",
    },
    _count: product._count,
    views: product.views,
    createdAt: product.createdAt,
  }));

  // Fetch categories for filters with error handling
  const categories = await withDatabaseErrorHandling(
    'fetchCategories',
    () => database.category.findMany({
      where: {
        parentId: null, // Only top-level categories
      },
      include: {
        children: true,
      },
    }),
    { parentId: null }
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Promotional Banner */}
      <PromotionalBanner />
      
      {/* Spacer for mobile navigation */}
      <div className="h-32 md:hidden" />
      
      {/* Products Grid - Same container as main page */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">
        {/* Header Section */}
        <div className="mb-6">
          <EnhancedHeader 
            totalCount={totalCount}
            currentFilters={searchParams}
          />

          {/* Mobile Filter and Sort Bar */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <ProductFiltersMobile 
              categories={categories}
              currentFilters={searchParams}
              dictionary={dictionary}
            />
            <div className="flex-1">
              <ProductSort currentSort={searchParams.sort} />
            </div>
          </div>
        </div>

        {/* Main Layout - Sidebar + Grid */}
        <div className="lg:flex lg:gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <CollapsibleFilters 
                categories={categories}
                currentFilters={searchParams}
                dictionary={dictionary}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {transformedProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find what you're looking for
                  </p>
                  <div className="lg:hidden">
                    <ProductFiltersMobile 
                      categories={categories}
                      currentFilters={searchParams}
                      dictionary={dictionary}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <ProductsClientWrapper 
                  products={transformedProducts}
                  searchParams={searchParams}
                  dictionary={dictionary}
                />
                {totalPages > 1 && (
                  <div className="border-t pt-6 mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      baseUrl="/products"
                      searchParams={searchParams}
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}