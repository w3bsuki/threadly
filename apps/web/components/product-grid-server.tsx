import { database, ProductStatus } from '@repo/database';
import { ProductGridClient } from './product-grid-client';
import type { 
  Product, 
  ProductImage, 
  User,
  Category,
  Condition
} from '@repo/database';

// Type for our transformed product data
interface TransformedProduct {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  size: string;
  condition: string;
  category: string;
  gender: string;
  images: string[];
  seller: {
    id: string;
    name: string;
    location: string;
    rating: number;
  };
  isLiked: boolean;
  isDesigner: boolean;
  uploadedAgo: string;
  _count?: {
    favorites: number;
  };
}

// Get time ago string
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

// Transform database product to UI format
function transformProduct(
  product: Product & {
    images: ProductImage[];
    seller: User;
    category: Category | null;
    _count?: {
      favorites: number;
    };
  }
): TransformedProduct {
  return {
    id: product.id,
    title: product.title,
    brand: product.brand || 'Unknown',
    price: product.price,
    originalPrice: undefined, // Not in our schema yet
    size: product.size || 'One Size',
    condition: product.condition,
    category: product.category?.name || 'Other',
    gender: 'unisex', // We don't have gender in the schema, default to unisex
    images: product.images
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(img => img.imageUrl),
    seller: {
      id: product.seller.id,
      name: `${product.seller.firstName} ${product.seller.lastName || ''}`.trim(),
      location: product.seller.location || 'Unknown',
      rating: product.seller.averageRating || 4.5,
    },
    isLiked: false, // This would come from user's favorites
    isDesigner: product.brand ? [
      'GUCCI', 'PRADA', 'CHANEL', 'LOUIS VUITTON', 'VERSACE', 
      'DIOR', 'BALENCIAGA', 'HERMÈS', 'SAINT LAURENT', 'BOTTEGA VENETA',
      'OFF-WHITE', 'BURBERRY', 'FENDI', 'GIVENCHY', 'VALENTINO'
    ].some(brand => product.brand!.toUpperCase().includes(brand)) : false,
    uploadedAgo: getTimeAgo(product.createdAt),
    _count: product._count || { favorites: 0 },
  };
}

interface ProductGridServerProps {
  category?: string;
  limit?: number;
}

export async function ProductGridServer({ 
  category, 
  limit = 24 
}: ProductGridServerProps) {
  try {
    // Build the where clause based on category
    const whereClause: any = {
      status: ProductStatus.AVAILABLE,
    };

    // Handle special categories
    if (category === 'designer') {
      // Find products from luxury brands
      whereClause.OR = [
        { brand: { contains: 'Gucci' } },
        { brand: { contains: 'Prada' } },
        { brand: { contains: 'Chanel' } },
        { brand: { contains: 'Louis Vuitton' } },
        { brand: { contains: 'Versace' } },
        { brand: { contains: 'Dior' } },
        { brand: { contains: 'Balenciaga' } },
        { brand: { contains: 'Hermès' } },
        { brand: { contains: 'Saint Laurent' } },
        { brand: { contains: 'Bottega Veneta' } },
      ];
    } else if (category && ['men', 'women', 'kids', 'unisex'].includes(category)) {
      // Handle gender-based categories by category name
      const genderCategory = await database.category.findFirst({
        where: {
          OR: [
            { slug: { contains: category } },
            { name: { contains: category } }
          ]
        }
      });
      if (genderCategory) {
        whereClause.categoryId = genderCategory.id;
      }
    } else if (category && category !== 'all') {
      // Map category names to enum values
      // Find category by name or slug
      const categoryFilter = await database.category.findFirst({
        where: {
          OR: [
            { name: { equals: category } },
            { slug: { equals: category } }
          ]
        }
      });
      
      if (categoryFilter) {
        whereClause.categoryId = categoryFilter.id;
      }
    }

    // Fetch real products from database
    const products = await database.product.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        seller: true,
        category: true,
        _count: {
          select: { favorites: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // If no products found, fetch some general products
    let finalProducts = products;
    if (products.length === 0) {
      finalProducts = await database.product.findMany({
        where: {
          status: ProductStatus.AVAILABLE,
        },
        include: {
          images: {
            orderBy: { displayOrder: 'asc' }
          },
          seller: true,
          category: true,
          _count: {
            select: { favorites: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 12, // Show fewer if no category matches
      });
    }

    // Transform products for the UI
    const transformedProducts = finalProducts.map(transformProduct);

    // Get filter options from actual data
    const categories = await database.category.findMany({
      select: { name: true },
      where: {
        products: {
          some: { status: ProductStatus.AVAILABLE }
        }
      },
    });

    const brands = await database.product.groupBy({
      by: ['brand'],
      where: { 
        status: ProductStatus.AVAILABLE,
        brand: { not: null }
      },
      _count: true,
      orderBy: { _count: { brand: 'desc' } },
      take: 10,
    });

    const sizes = await database.product.groupBy({
      by: ['size'],
      where: { status: ProductStatus.AVAILABLE },
      _count: true,
      orderBy: { _count: { size: 'desc' } },
      take: 10,
    });

    const filterOptions = {
      categories: categories.map(c => c.name),
      brands: brands.map(b => b.brand).filter(Boolean) as string[],
      sizes: sizes.map(s => s.size).filter(Boolean) as string[],
      totalCount: await database.product.count({
        where: { status: ProductStatus.AVAILABLE }
      })
    };

    return (
      <ProductGridClient 
        initialProducts={transformedProducts}
        filterOptions={filterOptions}
        defaultCategory={category}
      />
    );

  } catch (error) {
    console.error('Failed to fetch products:', error);
    
    // Return empty state on error
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Unable to load products
        </h2>
        <p className="text-gray-600 mb-8">
          We're having trouble loading products right now. Please try again later.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
        >
          Refresh page
        </a>
      </div>
    );
  }
}