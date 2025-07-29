#!/usr/bin/env tsx
import { PrismaClient } from '../packages/database/generated/client';

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error(
    'Please set the DATABASE_URL environment variable before running this script'
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function seedProducts() {
  console.log('🌱 Starting product seeding process...');

  try {
    // First, create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { email: 'test@threadly.com' },
      update: {},
      create: {
        clerkId: 'test_user_001',
        email: 'test@threadly.com',
        firstName: 'Test',
        lastName: 'Seller',
        verified: true,
        location: 'New York, NY',
      },
    });

    console.log(`✅ Test user ready: ${testUser.firstName} ${testUser.lastName}`);

    // Check if categories exist, create defaults if needed
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      console.log('📁 Creating default categories...');
      
      const defaultCategories = [
        { name: 'Women\'s Clothing', slug: 'women-clothing' },
        { name: 'Men\'s Clothing', slug: 'men-clothing' },
        { name: 'Designer Bags', slug: 'designer-bags' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Accessories', slug: 'accessories' },
      ];

      for (const cat of defaultCategories) {
        await prisma.category.create({ data: cat });
      }
      console.log('✅ Default categories created');
    }

    // Get categories
    const womenClothing = await prisma.category.findFirst({
      where: { slug: 'women-clothing' },
    });

    const menClothing = await prisma.category.findFirst({
      where: { slug: 'men-clothing' },
    });

    const designerBags = await prisma.category.findFirst({
      where: { slug: 'designer-bags' },
    });

    const shoesCategory = await prisma.category.findFirst({
      where: { slug: 'shoes' },
    });

    if (!(womenClothing && menClothing && designerBags)) {
      console.error('❌ Required categories not found. Please run seed-categories.ts first!');
      return;
    }

    // Comprehensive product data with images (consolidated from all seed scripts)
    const productData = [
      // From original seed-products.ts
      {
        title: 'Vintage Denim Jacket',
        description:
          'Classic 90s style denim jacket in excellent condition. Perfect for layering.',
        price: 45.0,
        condition: 'VERY_GOOD' as const,
        categoryId: womenClothing.id,
        brand: "Levi's",
        size: 'M',
        color: 'Blue',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
            alt: 'Vintage Denim Jacket - Front View',
            displayOrder: 0,
          },
        ],
      },
      {
        title: 'Designer Leather Handbag',
        description:
          'Authentic luxury handbag with dust bag and authentication card. Minor signs of wear.',
        price: 850.0,
        condition: 'GOOD' as const,
        categoryId: designerBags.id,
        brand: 'Gucci',
        color: 'Black',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop',
            alt: 'Designer Leather Handbag - Main View',
            displayOrder: 0,
          },
        ],
      },
      {
        title: 'Mens Wool Coat',
        description:
          'Premium wool coat, barely worn. Perfect for winter. Retail $500+',
        price: 125.0,
        condition: 'NEW_WITHOUT_TAGS' as const,
        categoryId: menClothing.id,
        brand: 'Zara',
        size: 'L',
        color: 'Navy',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
            alt: 'Premium Wool Winter Coat - Front View',
            displayOrder: 0,
          },
        ],
      },
      {
        title: 'Summer Floral Dress',
        description:
          'Beautiful floral print dress, perfect for summer occasions. Worn once.',
        price: 35.0,
        condition: 'VERY_GOOD' as const,
        categoryId: womenClothing.id,
        brand: 'H&M',
        size: 'S',
        color: 'Multicolor',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: `https://via.placeholder.com/600x800?text=${encodeURIComponent('Summer Floral Dress')}`,
            alt: 'Summer Floral Dress',
            displayOrder: 0,
          },
        ],
      },
      {
        title: 'Limited Edition Sneakers',
        description:
          'Rare collaboration sneakers, comes with original box. Authenticated.',
        price: 450.0,
        condition: 'NEW_WITH_TAGS' as const,
        categoryId: menClothing.id,
        brand: 'Nike x Off-White',
        size: '10',
        color: 'White/Black',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop',
            alt: 'Limited Edition Air Jordan 1 - Side View',
            displayOrder: 0,
          },
        ],  
      },
      // From seed-products-with-images.ts
      {
        title: "Vintage Levi's 501 Jeans",
        description:
          "Authentic vintage Levi's 501 jeans in excellent condition. Perfect fit, minimal fading, no stains or tears. These classic jeans have that perfect broken-in feel.",
        price: 75.0,
        condition: 'VERY_GOOD' as const,
        categoryId: womenClothing.id,
        brand: "Levi's",
        size: '28',
        color: 'Indigo Blue',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
            alt: "Vintage Levi's 501 Jeans - Front View",
            displayOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&h=800&fit=crop',
            alt: "Vintage Levi's 501 Jeans - Detail Shot",
            displayOrder: 1,
          },
        ],
      },
      {
        title: 'Designer Silk Blouse',
        description:
          'Beautiful designer silk blouse in pristine condition. Perfect for professional or evening wear. 100% silk with elegant draping.',
        price: 145.0,
        condition: 'NEW_WITHOUT_TAGS' as const,
        categoryId: womenClothing.id,
        brand: 'Theory',
        size: 'M',
        color: 'Cream',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1564257577-452677c4e096?w=600&h=800&fit=crop',
            alt: 'Designer Silk Blouse - Front View',
            displayOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop',
            alt: 'Designer Silk Blouse - Styling Shot',
            displayOrder: 1,
          },
        ],
      },
      {
        title: 'Vintage Band T-Shirt',
        description:
          'Authentic vintage band t-shirt from the 90s. Soft cotton with that perfect vintage feel. Some slight fading adds to the authentic vintage charm.',
        price: 55.0,
        condition: 'GOOD' as const,
        categoryId: menClothing.id,
        brand: 'Vintage',
        size: 'L',
        color: 'Black',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
            alt: 'Vintage Band T-Shirt - Front View',
            displayOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop',
            alt: 'Vintage Band T-Shirt - Detail',
            displayOrder: 1,
          },
        ],
      },
      {
        title: 'Luxury Designer Handbag',
        description:
          'Authentic luxury designer handbag in excellent condition. Comes with authenticity certificate, dust bag, and original packaging. Minor signs of wear.',
        price: 420.0,
        condition: 'VERY_GOOD' as const,
        categoryId: designerBags.id,
        brand: 'Coach',
        color: 'Cognac Brown',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop',
            alt: 'Luxury Designer Handbag - Main View',  
            displayOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop',
            alt: 'Luxury Designer Handbag - Interior View',
            displayOrder: 1,
          },
        ],
      },
      {
        title: 'Premium Wool Winter Coat',
        description:
          'High-quality wool winter coat, perfect for cold weather. Barely worn, like new condition. Originally retail $400+. Classic tailoring with modern fit.',
        price: 220.0,
        condition: 'NEW_WITHOUT_TAGS' as const,
        categoryId: womenClothing.id,
        brand: 'J.Crew',
        size: 'S',
        color: 'Navy Blue',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
            alt: 'Premium Wool Winter Coat - Front View',
            displayOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
            alt: 'Premium Wool Winter Coat - Detail Shot',
            displayOrder: 1,
          },
        ],
      },
      {
        title: 'Limited Edition Air Jordan 1',
        description:
          'Rare limited edition Air Jordan 1 in excellent condition. Comes with original box and all accessories. Authenticated by StockX.',
        price: 380.0,
        condition: 'NEW_WITH_TAGS' as const,
        categoryId: menClothing.id,
        brand: 'Nike Jordan',
        size: '10',
        color: 'Chicago Red/White',
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&h=800&fit=crop',
            alt: 'Limited Edition Air Jordan 1 - Side View',
            displayOrder: 0,
          },
          {
            imageUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=800&fit=crop',
            alt: 'Limited Edition Air Jordan 1 - Box and Accessories',
            displayOrder: 1,
          },
        ],
      },
      // From seed-test-products.ts (adapted with proper condition values)
      {
        title: 'Retro Sneakers',
        description:
          'Rare vintage sneakers from the 80s. Some signs of wear but still in great shape.',
        price: 150.0,
        brand: 'Nike',
        size: '10',
        color: 'White/Red',
        condition: 'GOOD' as const,
        categoryId: shoesCategory?.id || menClothing.id,
        sellerId: testUser.id,
        status: 'AVAILABLE' as const,
        images: [
          {
            imageUrl: `https://via.placeholder.com/600x800?text=${encodeURIComponent('Retro Sneakers')}`,
            alt: 'Retro Sneakers',
            displayOrder: 0,
          },
        ],
      },
    ];

    // Create products with images
    console.log('🛍️ Creating products with images...');
    let createdCount = 0;
    
    for (const productInfo of productData) {
      const { images, ...productFields } = productInfo;

      try {
        const product = await prisma.product.create({
          data: {
            ...productFields,
            images: {
              create: images,
            },
          },
          include: {
            images: true,
          },
        });

        console.log(`✅ Created: ${product.title} (${product.images.length} images)`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Failed to create ${productFields.title}:`, error);
      }
    }

    // Show comprehensive summary
    const totalProducts = await prisma.product.count();
    const availableProducts = await prisma.product.count({
      where: { status: 'AVAILABLE' },
    });
    const productsWithImages = await prisma.product.count({
      where: {
        images: {
          some: {},
        },
      },
    });

    console.log('\n🎉 Product seeding completed!');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Available products: ${availableProducts}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Successfully created: ${createdCount} products`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedProducts()
  .then(() => {
    console.log('✅ Seed process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed process failed:', error);
    process.exit(1);
  });
