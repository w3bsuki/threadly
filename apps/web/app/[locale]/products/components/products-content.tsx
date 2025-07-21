import type { Prisma } from '@repo/database';
import { database } from '@repo/database';
import type { Dictionary } from '@repo/internationalization';
import { UnifiedSearchFilters } from '../../components/unified-search-filters';
import { CollapsibleFilters } from './collapsible-filters';
import { EnhancedHeader } from './enhanced-header';
import { Pagination } from './pagination';
import { ProductFiltersMobile } from './product-filters-mobile';
import { ProductsClientWrapper } from './products-client-wrapper';
import { SearchHeader } from './search-header';

const ITEMS_PER_PAGE = 12;

interface ProductsContentProps {
  searchParams: {
    q?: string;
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

export async function ProductsContent({
  searchParams,
  dictionary,
}: ProductsContentProps) {
  const page = Number.parseInt(searchParams.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build where clause for filtering
  const where: Prisma.ProductWhereInput = {
    status: 'AVAILABLE',
  };

  // Handle search query
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
      { brand: { contains: searchParams.q, mode: 'insensitive' } },
      { category: { name: { contains: searchParams.q, mode: 'insensitive' } } },
    ];
  }

  // Handle gender filtering by category name
  if (searchParams.gender) {
    where.category = {
      OR: [
        { name: { contains: searchParams.gender, mode: 'insensitive' } },
        { slug: { contains: searchParams.gender, mode: 'insensitive' } },
      ],
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
              { slug: { contains: searchParams.gender, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              {
                name: { contains: searchParams.category, mode: 'insensitive' },
              },
              {
                slug: { contains: searchParams.category, mode: 'insensitive' },
              },
            ],
          },
        ],
      };
    } else {
      // Handle exact category match and hierarchical filtering
      where.category = {
        OR: [
          { slug: searchParams.category },
          { name: { contains: searchParams.category, mode: 'insensitive' } },
          { slug: { contains: searchParams.category, mode: 'insensitive' } },
          // Also match parent categories
          { 
            Category: { 
              slug: searchParams.category 
            } 
          },
        ],
      };
    }
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) {
      where.price.gte = Number.parseFloat(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
      where.price.lte = Number.parseFloat(searchParams.maxPrice);
    }
  }

  if (searchParams.condition) {
    where.condition = searchParams.condition as any; // Type assertion for condition enum
  }

  // Build orderBy for sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // default to newest

  if (searchParams.sort === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (searchParams.sort === 'price-asc') {
    orderBy = { price: 'asc' };
  } else if (searchParams.sort === 'price-desc') {
    orderBy = { price: 'desc' };
  } else if (searchParams.sort === 'popular') {
    orderBy = { views: 'desc' };
  } else if (searchParams.sort === 'alphabetical') {
    orderBy = { title: 'asc' };
  }

  // Fetch products with pagination
  const [products, totalCount] = await Promise.all([
    database.product.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
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
    database.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Transform products to match ProductGrid interface
  const transformedProducts = products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    condition: product.condition,
    category: product.category.name,
    brand: product.brand || undefined,
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      alt: image.alt || undefined,
      displayOrder: image.displayOrder,
    })),
    seller: {
      id: product.seller.id,
      firstName: product.seller.firstName || 'Anonymous',
    },
    _count: product._count,
    views: product.views,
    createdAt: product.createdAt,
  }));

  // Fetch categories for filters
  const categories = await database.category.findMany({
    where: {
      parentId: null, // Only top-level categories
    },
    include: {
      other_Category: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <SearchHeader 
        totalCount={totalCount} 
        searchQuery={searchParams.q}
      />
      
      {/* Unified Search Filters - Mobile Only */}
      <div className="border-0 lg:hidden">
        <UnifiedSearchFilters totalCount={totalCount} />
      </div>

      {/* Products Grid - Same container as main page */}
      <div className="mx-auto max-w-7xl px-4 pt-3 pb-6">
        {/* Header Section - Desktop Only */}
        <div className="mb-6 hidden lg:block">
          <EnhancedHeader
            currentFilters={searchParams}
            totalCount={totalCount}
          />
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
          <main className="min-w-0 flex-1">
            {transformedProducts.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto max-w-md">
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    No products found
                  </h3>
                  <p className="mb-6 text-muted-foreground text-sm">
                    Try adjusting your filters or search terms to find what
                    you're looking for
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
                  dictionary={dictionary}
                  products={transformedProducts}
                  searchParams={searchParams}
                />
                {totalPages > 1 && (
                  <div className="mt-8 border-t pt-6">
                    <Pagination
                      baseUrl="/products"
                      currentPage={page}
                      searchParams={searchParams}
                      totalPages={totalPages}
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
