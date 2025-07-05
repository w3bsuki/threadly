import { NextResponse, NextRequest } from "next/server";
import { database } from "@repo/database";
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'This endpoint is disabled in production' },
        { status: 403 }
      );
    }
    // First, create a test category if it doesn't exist
    const category = await database.category.upsert({
      where: { slug: "womens-clothing" },
      update: {},
      create: {
        name: "Women's Clothing",
        slug: "womens-clothing",
      },
    });

    // Create a test user if it doesn't exist
    const seller = await database.user.upsert({
      where: { email: "test-seller@example.com" },
      update: {},
      create: {
        clerkId: "test-seller-clerk-id",
        email: "test-seller@example.com",
        firstName: "Sarah",
        lastName: "Johnson",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b1a5?w=150&h=150&fit=crop&crop=face",
      },
    });

    // Sample products to create
    const sampleProducts = [
      {
        title: "Vintage Levi's 501 Jeans",
        description: "Classic vintage Levi's 501 jeans in excellent condition. Perfect fit, no stains or tears. Size 28 waist.",
        price: 65.00,
        condition: "VERY_GOOD" as const,
        size: "28",
        brand: "Levi's",
        color: "Blue",
        categoryId: category.id,
        sellerId: seller.id,
        images: [
          {
            imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
            alt: "Vintage Levi's 501 Jeans",
            displayOrder: 0,
          },
        ],
      },
      {
        title: "Designer Silk Blouse",
        description: "Beautiful designer silk blouse in pristine condition. Perfect for professional or evening wear.",
        price: 120.00,
        condition: "NEW_WITHOUT_TAGS" as const,
        size: "M",
        brand: "Theory",
        color: "Cream",
        categoryId: category.id,
        sellerId: seller.id,
        images: [
          {
            imageUrl: "https://images.unsplash.com/photo-1564257577-452677c4e096?w=600&h=800&fit=crop",
            alt: "Designer Silk Blouse",
            displayOrder: 0,
          },
        ],
      },
      {
        title: "Vintage Band T-Shirt",
        description: "Authentic vintage band t-shirt from the 90s. Some slight fading but adds to the vintage charm.",
        price: 45.00,
        condition: "GOOD" as const,
        size: "L",
        brand: "Vintage",
        color: "Black",
        categoryId: category.id,
        sellerId: seller.id,
        images: [
          {
            imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
            alt: "Vintage Band T-Shirt",
            displayOrder: 0,
          },
        ],
      },
      {
        title: "Designer Handbag",
        description: "Luxury designer handbag in excellent condition. Comes with authenticity certificate.",
        price: 350.00,
        condition: "VERY_GOOD" as const,
        brand: "Coach",
        color: "Brown",
        categoryId: category.id,
        sellerId: seller.id,
        images: [
          {
            imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop",
            alt: "Designer Handbag",
            displayOrder: 0,
          },
        ],
      },
      {
        title: "Wool Winter Coat",
        description: "Warm wool winter coat, perfect for cold weather. Barely worn, like new condition.",
        price: 180.00,
        condition: "NEW_WITHOUT_TAGS" as const,
        size: "S",
        brand: "J.Crew",
        color: "Navy",
        categoryId: category.id,
        sellerId: seller.id,
        images: [
          {
            imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
            alt: "Wool Winter Coat",
            displayOrder: 0,
          },
        ],
      },
    ];

    // Create products with images
    const createdProducts = [];
    for (const productData of sampleProducts) {
      const { images, ...productInfo } = productData;
      
      const product = await database.product.create({
        data: {
          ...productInfo,
          images: {
            create: images,
          },
        },
        include: {
          images: true,
        },
      });
      
      createdProducts.push(product);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdProducts.length} sample products`,
      products: createdProducts,
    });
  } catch (error) {
    logError("Error seeding products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed products" },
      { status: 500 }
    );
  }
}