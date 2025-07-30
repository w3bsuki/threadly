import type { Metadata } from 'next';
import type {
  FAQPage,
  ItemList,
  WebPage,
  WithContext,
} from 'schema-dts';
import { createMetadata } from './metadata';

// Enhanced product page metadata
export function createProductMetadata({
  product,
  seller,
  images,
}: {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    condition: string;
    brand?: string;
    size?: string;
    color?: string;
  };
  seller: {
    firstName?: string;
    lastName?: string;
  };
  images: Array<{ imageUrl: string }>;
}): Metadata {
  const sellerName =
    `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Seller';
  const priceFormatted = (product.price / 100).toFixed(2);

  const title = `${product.title} - ${product.brand ? `${product.brand} ` : ''}$${priceFormatted}`;
  const description = `${product.condition} ${product.brand ? `${product.brand} ` : ''}${product.title}${product.size ? ` in size ${product.size}` : ''} for $${priceFormatted}. Sold by ${sellerName} on Threadly marketplace.`;

  return createMetadata({
    title,
    description,
    image: images[0]?.imageUrl,
    openGraph: {
      type: 'website',
      title,
      description,
      images: images.slice(0, 4).map((img) => ({
        url: img.imageUrl,
        width: 800,
        height: 800,
        alt: product.title,
      })),
      siteName: 'Threadly',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images[0]?.imageUrl,
    },
    other: {
      'product:price:amount': priceFormatted,
      'product:price:currency': 'USD',
      'product:condition': product.condition,
      'product:brand': product.brand || '',
      'product:availability': 'in stock',
    },
  });
}

// Category page metadata
export function createCategoryMetadata({
  category,
  productCount,
  featuredProducts,
}: {
  category: {
    name: string;
    description?: string;
    slug: string;
  };
  productCount: number;
  featuredProducts?: Array<{
    title: string;
    price: number;
    images: Array<{ imageUrl: string }>;
  }>;
}): Metadata {
  const title = `${category.name} - Pre-loved Fashion on Threadly`;
  const description =
    category.description ||
    `Shop ${productCount.toLocaleString()} pre-loved ${category.name.toLowerCase()} items on Threadly. Discover unique pieces from trusted sellers with fast shipping and secure payments.`;

  return createMetadata({
    title,
    description,
    image: featuredProducts?.[0]?.images[0]?.imageUrl,
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: 'Threadly',
    },
    other: {
      'category:name': category.name,
      'category:product_count': productCount.toString(),
    },
  });
}

// Search results metadata
export function createSearchMetadata({
  query,
  resultCount,
  filters,
}: {
  query?: string;
  resultCount: number;
  filters?: {
    categories?: string[];
    brands?: string[];
    priceMin?: number;
    priceMax?: number;
  };
}): Metadata {
  const title = query
    ? `"${query}" - ${resultCount.toLocaleString()} results on Threadly`
    : `Shop Pre-loved Fashion - ${resultCount.toLocaleString()} items on Threadly`;

  const description = query
    ? `Found ${resultCount.toLocaleString()} pre-loved fashion items matching "${query}" on Threadly marketplace. Discover unique pieces from trusted sellers.`
    : `Browse ${resultCount.toLocaleString()} pre-loved fashion items on Threadly. Find unique pieces from brands you love with fast shipping and secure payments.`;

  return createMetadata({
    title,
    description,
    robots: 'index,follow',
    other: {
      'search:query': query || '',
      'search:results': resultCount.toString(),
      'search:filters': filters ? JSON.stringify(filters) : '',
    },
  });
}

// Seller profile metadata
export function createSellerMetadata({
  seller,
  stats,
}: {
  seller: {
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    location?: string;
    averageRating?: number;
  };
  stats: {
    productCount: number;
    reviewCount: number;
    followerCount: number;
  };
}): Metadata {
  const sellerName =
    `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Seller';
  const joinDate = seller.createdAt.getFullYear();

  const title = `${sellerName} - Trusted Seller on Threadly`;
  const description = `Shop from ${sellerName}, a trusted seller on Threadly since ${joinDate}. ${stats.productCount} items listed with ${seller.averageRating ? `${seller.averageRating.toFixed(1)}/5 stars` : 'great reviews'} from ${stats.reviewCount} customers.`;

  return createMetadata({
    title,
    description,
    openGraph: {
      type: 'profile',
      title,
      description,
      siteName: 'Threadly',
    },
    other: {
      'profile:first_name': seller.firstName || '',
      'profile:last_name': seller.lastName || '',
      'profile:username': sellerName,
    },
  });
}

// Product listing structured data
export function generateProductListingStructuredData(
  products: Array<{
    id: string;
    title: string;
    price: number;
    images: Array<{ imageUrl: string }>;
    brand?: string;
  }>
): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'Product',
      position: index + 1,
      name: product.title,
      image: product.images[0]?.imageUrl,
      brand: product.brand
        ? {
            '@type': 'Brand',
            name: product.brand,
          }
        : undefined,
      offers: {
        '@type': 'Offer',
        price: (product.price / 100).toFixed(2),
        priceCurrency: 'USD',
        url: `https://threadly.com/product/${product.id}`,
      },
    })),
  };
}

// FAQ structured data for marketplace pages
export function generateMarketplaceFAQStructuredData(): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I buy items on Threadly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Browse our marketplace, add items to your cart, and checkout securely with Stripe. All purchases are protected by our buyer guarantee.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I sell items on Threadly?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Create a seller account, upload photos of your items, set your price, and list them for sale. We handle payments and provide seller protection.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Threadly safe to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We use secure payment processing with Stripe, verify all users, and provide buyer/seller protection for all transactions.',
        },
      },
      {
        '@type': 'Question',
        name: 'What condition are the items in?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All items are pre-loved and accurately described by condition: New with tags, New without tags, Very good, Good, and Satisfactory. Photos show actual condition.',
        },
      },
      {
        '@type': 'Question',
        name: 'How fast is shipping?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most orders ship within 1-2 business days. Standard shipping takes 5-7 days, express shipping 2-3 days. Free shipping on orders over $50.',
        },
      },
    ],
  };
}

// Homepage structured data
export function generateHomepageStructuredData(): WithContext<WebPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Threadly - Premium C2C Fashion Marketplace',
    description:
      'Buy and sell pre-loved fashion from brands you love. Discover unique pieces with fast shipping, secure payments, and buyer protection.',
    url: 'https://threadly.com',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Threadly',
      url: 'https://threadly.com',
    },
    about: {
      '@type': 'Organization',
      name: 'Threadly',
      description: 'Premium C2C fashion marketplace',
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'Threadly Fashion Marketplace',
      description: 'Curated marketplace for pre-loved fashion',
    },
  };
}

// Utility to inject structured data script
export function StructuredDataScript({ data }: { data: WithContext<any> }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}
