import type { WithContext, Organization, WebSite, Product, BreadcrumbList, Review } from 'schema-dts';

// Organization structured data
export const organizationStructuredData: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Threadly',
  url: 'https://threadly.com',
  logo: 'https://threadly.com/icon.png',
  description: 'Premium C2C fashion marketplace for buying and selling pre-loved clothing',
  sameAs: [
    'https://twitter.com/threadly',
    'https://instagram.com/threadly',
    'https://facebook.com/threadly',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-555-0123',
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Fashion St',
    addressLocality: 'New York',
    addressRegion: 'NY',
    postalCode: '10001',
    addressCountry: 'US',
  },
};

// Website structured data
export const websiteStructuredData: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Threadly',
  url: 'https://threadly.com',
  description: 'Buy and sell pre-loved fashion. Discover unique pieces from brands you love.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://threadly.com/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  } as any,
};

// Product structured data generator
export function generateProductStructuredData(product: {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  brand?: string;
  size?: string;
  color?: string;
  images: Array<{ imageUrl: string; alt?: string }>;
  seller: {
    firstName?: string;
    lastName?: string;
  };
  category: {
    name: string;
  };
  averageRating?: number;
  reviewCount?: number;
}): WithContext<Product> {
  const sellerName = `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Anonymous Seller';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map(img => img.imageUrl),
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    category: product.category.name,
    color: product.color,
    size: product.size,
    itemCondition: `https://schema.org/${product.condition === 'NEW' ? 'NewCondition' : 'UsedCondition'}`,
    offers: {
      '@type': 'Offer',
      price: (product.price / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: sellerName,
      },
      url: `https://threadly.com/product/${product.id}`,
    },
    aggregateRating: product.averageRating && product.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating.toString(),
      reviewCount: product.reviewCount,
    } as any : undefined,
    sku: product.id,
    productID: product.id,
  };
}

// Breadcrumb structured data generator
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string;
  url: string;
}>): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

// Review structured data generator
export function generateReviewStructuredData(review: {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  reviewer: {
    firstName?: string;
    lastName?: string;
  };
  product: {
    id: string;
    title: string;
  };
}): WithContext<Review> {
  const reviewerName = `${review.reviewer.firstName || ''} ${review.reviewer.lastName || ''}`.trim() || 'Anonymous';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: reviewerName,
    },
    datePublished: review.createdAt.toISOString(),
    reviewBody: review.comment,
    itemReviewed: {
      '@type': 'Product',
      name: review.product.title,
      url: `https://threadly.com/product/${review.product.id}`,
    },
  };
}