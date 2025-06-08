/**
 * Product validation schemas
 */

import { z } from 'zod';
import { 
  priceSchema, 
  currencySchema, 
  safeTextSchema, 
  imageFileSchema,
  uuidSchema,
  cuidSchema,
} from './common';

// Product conditions
export const productConditionSchema = z.enum([
  'NEW_WITH_TAGS',
  'NEW_WITHOUT_TAGS',
  'VERY_GOOD',
  'GOOD',
  'FAIR',
], {
  errorMap: () => ({ message: 'Invalid product condition' }),
});

// Product categories
export const productCategorySchema = z.enum([
  'WOMEN',
  'MEN',
  'KIDS',
  'UNISEX',
  'DESIGNER',
], {
  errorMap: () => ({ message: 'Invalid product category' }),
});

// Product subcategories
export const productSubcategorySchema = z.enum([
  // Women
  'DRESSES',
  'TOPS',
  'BOTTOMS',
  'OUTERWEAR',
  'SHOES',
  'BAGS',
  'ACCESSORIES',
  'JEWELRY',
  'SWIMWEAR',
  'LINGERIE',
  // Men
  'SHIRTS',
  'T_SHIRTS',
  'PANTS',
  'SHORTS',
  'SUITS',
  'JACKETS',
  'SWEATERS',
  'ACTIVEWEAR',
  // Kids
  'BABY',
  'TODDLER',
  'GIRLS',
  'BOYS',
  // General
  'OTHER',
], {
  errorMap: () => ({ message: 'Invalid product subcategory' }),
});

// Product sizes
export const productSizeSchema = z.enum([
  // Clothing
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  // Shoes (EU)
  '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46',
  // Kids
  '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M',
  '2T', '3T', '4T', '5T',
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16',
  // General
  'ONE_SIZE',
  'CUSTOM',
], {
  errorMap: () => ({ message: 'Invalid product size' }),
});

// Product colors
export const productColorSchema = z.enum([
  'BLACK',
  'WHITE',
  'GRAY',
  'RED',
  'BLUE',
  'GREEN',
  'YELLOW',
  'ORANGE',
  'PURPLE',
  'PINK',
  'BROWN',
  'BEIGE',
  'NAVY',
  'GOLD',
  'SILVER',
  'MULTICOLOR',
  'OTHER',
], {
  errorMap: () => ({ message: 'Invalid product color' }),
});

// Product materials
export const productMaterialSchema = z.enum([
  'COTTON',
  'POLYESTER',
  'WOOL',
  'SILK',
  'LEATHER',
  'DENIM',
  'LINEN',
  'CASHMERE',
  'SYNTHETIC',
  'MIXED',
  'OTHER',
], {
  errorMap: () => ({ message: 'Invalid product material' }),
});

// Brand validation
export const brandSchema = safeTextSchema
  .max(50, 'Brand name must be at most 50 characters')
  .optional();

// Product image schema
export const productImageSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Invalid image URL'),
  alt: safeTextSchema.max(100).optional(),
  order: z.number().int().min(0).max(10).default(0),
});

// Create product schema
export const createProductSchema = z.object({
  title: safeTextSchema
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  
  description: safeTextSchema
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  
  price: priceSchema,
  currency: currencySchema.default('USD'),
  
  category: productCategorySchema,
  subcategory: productSubcategorySchema,
  
  condition: productConditionSchema,
  size: productSizeSchema,
  color: productColorSchema,
  material: productMaterialSchema.optional(),
  
  brand: brandSchema,
  
  images: z.array(productImageSchema)
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  
  tags: z.array(safeTextSchema.max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  
  quantity: z.number()
    .int()
    .positive('Quantity must be positive')
    .max(100, 'Maximum quantity is 100')
    .default(1),
  
  shippingPrice: priceSchema.optional(),
  
  isPublished: z.boolean().default(true),
});

// Update product schema (partial)
export const updateProductSchema = createProductSchema.partial();

// Product search/filter schema
export const productFilterSchema = z.object({
  search: safeTextSchema.max(100).optional(),
  category: z.array(productCategorySchema).optional(),
  subcategory: z.array(productSubcategorySchema).optional(),
  condition: z.array(productConditionSchema).optional(),
  size: z.array(productSizeSchema).optional(),
  color: z.array(productColorSchema).optional(),
  material: z.array(productMaterialSchema).optional(),
  brand: z.array(brandSchema).optional(),
  priceMin: priceSchema.optional(),
  priceMax: priceSchema.optional(),
  isPublished: z.boolean().optional(),
  sellerId: uuidSchema.optional(),
});

// Product ID schema
export const productIdSchema = z.object({
  id: cuidSchema,
});

// Bulk product operation schema
export const bulkProductOperationSchema = z.object({
  productIds: z.array(cuidSchema).min(1).max(100),
  operation: z.enum(['publish', 'unpublish', 'delete']),
});

// Product view tracking schema
export const productViewSchema = z.object({
  productId: cuidSchema,
  viewerId: uuidSchema.optional(),
  referrer: z.string().url().optional(),
});

// Product favorite schema
export const productFavoriteSchema = z.object({
  productId: cuidSchema,
  userId: uuidSchema,
});

// Product report schema
export const productReportSchema = z.object({
  productId: cuidSchema,
  reason: z.enum([
    'INAPPROPRIATE',
    'COUNTERFEIT',
    'MISLEADING',
    'SPAM',
    'OTHER',
  ]),
  description: safeTextSchema.max(500).optional(),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type ProductCondition = z.infer<typeof productConditionSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type ProductSize = z.infer<typeof productSizeSchema>;
export type ProductColor = z.infer<typeof productColorSchema>;