import type { CommerceProduct } from '../types';

// Client-safe price formatting utility to avoid Prisma client issues
function formatPrice(cents: number, currency: string = 'USD'): string {
  const dollars = cents / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

// Product condition labels
export const PRODUCT_CONDITIONS = {
  NEW: 'New with Tags',
  LIKE_NEW: 'Like New',
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
} as const;

// Get condition color for UI
export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    NEW: 'green',
    LIKE_NEW: 'blue',
    EXCELLENT: 'indigo',
    GOOD: 'yellow',
    FAIR: 'orange',
  };
  return colors[condition] || 'gray';
}

// Format product price (handles database format)
export function formatProductPrice(price: number): string {
  // Assuming price is stored in dollars in database
  const cents = Math.round(price * 100);
  return formatPrice(cents);
}

// Calculate discount percentage
export function calculateDiscount(
  originalPrice: number,
  salePrice: number
): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Generate product URL slug
export function generateProductSlug(product: CommerceProduct): string {
  const titleSlug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return `${titleSlug}-${product.id}`;
}

// Parse product ID from slug
export function parseProductIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  return parts[parts.length - 1] || null;
}

// Check if product is new (listed within X days)
export function isNewProduct(
  product: CommerceProduct,
  daysThreshold: number = 7
): boolean {
  const createdDate = new Date(product.createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= daysThreshold;
}

// Get product badge
export function getProductBadge(product: CommerceProduct): {
  text: string;
  color: string;
} | null {
  if (product.status === 'SOLD') {
    return { text: 'Sold', color: 'red' };
  }
  
  if (product.status === 'RESERVED') {
    return { text: 'Reserved', color: 'yellow' };
  }
  
  if (isNewProduct(product)) {
    return { text: 'New', color: 'green' };
  }
  
  if (product.condition === 'NEW') {
    return { text: 'Brand New', color: 'blue' };
  }
  
  return null;
}

// Sort products
export function sortProducts(
  products: CommerceProduct[],
  sortBy: 'price' | 'createdAt' | 'title' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): CommerceProduct[] {
  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'createdAt':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return 0;
    }
  });

  return sortOrder === 'desc' ? sorted.reverse() : sorted;
}

// Filter products by price range
export function filterByPriceRange(
  products: CommerceProduct[],
  minPrice?: number,
  maxPrice?: number
): CommerceProduct[] {
  return products.filter(product => {
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;
    return true;
  });
}

// Group products by category
export function groupProductsByCategory(
  products: CommerceProduct[]
): Record<string, CommerceProduct[]> {
  return products.reduce((groups, product) => {
    const category = product.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, CommerceProduct[]>);
}

// Get unique values for filters
export function getUniqueFilterValues(
  products: CommerceProduct[]
): {
  conditions: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  categories: string[];
} {
  const conditions = new Set<string>();
  const sizes = new Set<string>();
  const colors = new Set<string>();
  const brands = new Set<string>();
  const categories = new Set<string>();

  products.forEach(product => {
    if (product.condition) conditions.add(product.condition);
    if (product.size) sizes.add(product.size);
    if (product.color) colors.add(product.color);
    if (product.brand) brands.add(product.brand);
    if (product.category) categories.add(product.category);
  });

  return {
    conditions: Array.from(conditions).sort(),
    sizes: Array.from(sizes).sort(),
    colors: Array.from(colors).sort(),
    brands: Array.from(brands).sort(),
    categories: Array.from(categories).sort(),
  };
}

// Validate product data
export function validateProduct(product: Partial<CommerceProduct>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!product.title?.trim()) {
    errors.push('Title is required');
  }

  if (!product.description?.trim()) {
    errors.push('Description is required');
  }

  if (!product.price || product.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!product.images?.length) {
    errors.push('At least one image is required');
  }

  if (!product.category) {
    errors.push('Category is required');
  }

  if (!product.condition) {
    errors.push('Condition is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get share URL for product
export function getProductShareUrl(
  product: CommerceProduct,
  baseUrl: string = ''
): string {
  const slug = generateProductSlug(product);
  return `${baseUrl}/product/${slug}`;
}

// Get product meta tags for SEO
export function getProductMetaTags(product: CommerceProduct): {
  title: string;
  description: string;
  keywords: string[];
  image: string;
} {
  const keywords = [
    product.category,
    product.subcategory,
    product.brand,
    product.condition,
    'fashion',
    'marketplace',
  ].filter(Boolean) as string[];

  return {
    title: `${product.title} - ${formatProductPrice(product.price)}`,
    description: product.description.slice(0, 160),
    keywords,
    image: product.images[0] || '',
  };
}