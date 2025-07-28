// Marketplace-specific components for Threadly

export { ConditionBadge } from './condition-badge';
export type {
  CursorPaginationProps,
  CursorPaginationState,
} from './cursor-pagination';
export { CursorPagination, useCursorPagination } from './cursor-pagination';
export type { ProductCardProps } from './product-card';
export { ProductCard, ProductGrid } from './product-card';
export type {
  ProductImageGalleryProps,
  ProductImageProps,
} from './product-image';
export { ProductImage, ProductImageGallery } from './product-image';
export type { SellerProfileProps } from './seller-profile';
export { SellerProfile } from './seller-profile';
export type {
  MarketplaceTrustSectionProps,
  TrustBadgeCollectionProps,
  TrustBadgeProps,
} from './trust-badges';
export {
  MarketplaceTrustSection,
  TrustBadge,
  TrustBadgeCollection,
  threadlyTrustFeatures,
} from './trust-badges';

// Re-export commonly used types
export type ProductData = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: Array<{ imageUrl: string; alt?: string }>;
  condition: 1 | 2 | 3 | 4 | 5;
  brand?: string;
  size?: string;
  isLiked?: boolean;
  isNew?: boolean;
  discountPercentage?: number;
};

export type SellerData = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  location?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  joinedAt: Date;
  averageRating?: number;
  totalReviews: number;
};

export type SellerStats = {
  totalListings: number;
  totalSales: number;
  followersCount: number;
  followingCount: number;
  responseRate?: number;
  averageShippingTime?: number;
};
