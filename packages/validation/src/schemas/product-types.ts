import { z } from 'zod';

export const ProductConditionSchema = z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']);
export type ProductCondition = z.infer<typeof ProductConditionSchema>;

export const ProductStatusSchema = z.enum(['DRAFT', 'AVAILABLE', 'SOLD', 'REMOVED', 'RESERVED']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const ProductImageSchema = z.object({
  id: z.string(),
  imageUrl: z.string().url(),
  alt: z.string().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

export type ProductImage = z.infer<typeof ProductImageSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().positive(),
  condition: ProductConditionSchema,
  status: ProductStatusSchema,
  categoryId: z.string(),
  sellerId: z.string(),
  size: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  measurements: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(ProductImageSchema),
  viewCount: z.number().int().min(0).default(0),
  favoriteCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  soldAt: z.date().nullable().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  sellerId: true,
  viewCount: true,
  favoriteCount: true,
  createdAt: true,
  updatedAt: true,
  soldAt: true,
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export const ProductFilterSchema = z.object({
  query: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  conditions: z.array(ProductConditionSchema).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sizes: z.array(z.string()).optional(),
  brands: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sellerIds: z.array(z.string()).optional(),
  status: z.array(ProductStatusSchema).optional(),
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;