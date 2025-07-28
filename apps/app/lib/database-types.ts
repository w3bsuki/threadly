// Temporary types until database schema is updated
// These should eventually be moved to the Prisma schema

export type BulkOperationType =
  | 'PRICE_UPDATE'
  | 'STATUS_CHANGE'
  | 'CATEGORY_UPDATE'
  | 'CONDITION_UPDATE'
  | 'BRAND_UPDATE'
  | 'SIZE_UPDATE'
  | 'COLOR_UPDATE'
  | 'DELETE'
  | 'ARCHIVE'
  | 'UNARCHIVE';

export type BulkOperationStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type RecommendationType =
  | 'SIMILAR_ITEMS'
  | 'TRENDING'
  | 'PERSONALIZED'
  | 'RECENTLY_VIEWED'
  | 'FREQUENTLY_BOUGHT_TOGETHER'
  | 'SEASONAL'
  | 'NEW_ARRIVALS';

export type UserPreferenceRole = 'BUYER' | 'SELLER' | 'BOTH';

export type InteractionType =
  | 'PURCHASE'
  | 'CART_ADD'
  | 'FAVORITE'
  | 'REVIEW'
  | 'SHARE'
  | 'VIEW'
  | 'SEARCH_CLICK';
