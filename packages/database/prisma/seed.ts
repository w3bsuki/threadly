import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main() {

  // Create comprehensive category structure inspired by Vinted/Depop best practices
  const categories = [
    {
      name: 'Women',
      slug: 'women',
      imageUrl: '/categories/women.jpg',
      children: [
        {
          name: 'Clothing',
          slug: 'women-clothing',
          children: [
            { name: 'Dresses', slug: 'women-dresses' },
            { name: 'Tops & T-shirts', slug: 'women-tops' },
            { name: 'Sweaters & Knitwear', slug: 'women-sweaters' },
            { name: 'Jackets & Coats', slug: 'women-jackets' },
            { name: 'Jeans', slug: 'women-jeans' },
            { name: 'Trousers', slug: 'women-trousers' },
            { name: 'Skirts', slug: 'women-skirts' },
            { name: 'Shorts', slug: 'women-shorts' },
            { name: 'Activewear', slug: 'women-activewear' },
            { name: 'Swimwear', slug: 'women-swimwear' },
            { name: 'Lingerie & Nightwear', slug: 'women-lingerie' },
            { name: 'Jumpsuits & Playsuits', slug: 'women-jumpsuits' },
            { name: 'Blazers', slug: 'women-blazers' },
          ]
        },
        {
          name: 'Shoes',
          slug: 'women-shoes',
          children: [
            { name: 'Sneakers', slug: 'women-sneakers' },
            { name: 'Heels', slug: 'women-heels' },
            { name: 'Boots', slug: 'women-boots' },
            { name: 'Flats', slug: 'women-flats' },
            { name: 'Sandals', slug: 'women-sandals' },
            { name: 'Athletic Shoes', slug: 'women-athletic-shoes' },
          ]
        },
        {
          name: 'Bags & Accessories',
          slug: 'women-bags-accessories',
          children: [
            { name: 'Handbags', slug: 'women-handbags' },
            { name: 'Crossbody Bags', slug: 'women-crossbody' },
            { name: 'Backpacks', slug: 'women-backpacks' },
            { name: 'Clutches', slug: 'women-clutches' },
            { name: 'Scarves', slug: 'women-scarves' },
            { name: 'Belts', slug: 'women-belts' },
            { name: 'Hats', slug: 'women-hats' },
            { name: 'Sunglasses', slug: 'women-sunglasses' },
            { name: 'Hair Accessories', slug: 'women-hair-accessories' },
          ]
        },
        {
          name: 'Jewelry',
          slug: 'women-jewelry',
          children: [
            { name: 'Necklaces', slug: 'women-necklaces' },
            { name: 'Earrings', slug: 'women-earrings' },
            { name: 'Bracelets', slug: 'women-bracelets' },
            { name: 'Rings', slug: 'women-rings' },
            { name: 'Watches', slug: 'women-watches' },
            { name: 'Body Jewelry', slug: 'women-body-jewelry' },
          ]
        }
      ]
    },
    {
      name: 'Men',
      slug: 'men',
      imageUrl: '/categories/men.jpg',
      children: [
        {
          name: 'Clothing',
          slug: 'men-clothing',
          children: [
            { name: 'T-shirts & Tanks', slug: 'men-tshirts' },
            { name: 'Shirts', slug: 'men-shirts' },
            { name: 'Sweaters & Hoodies', slug: 'men-sweaters' },
            { name: 'Jackets & Coats', slug: 'men-jackets' },
            { name: 'Jeans', slug: 'men-jeans' },
            { name: 'Trousers', slug: 'men-trousers' },
            { name: 'Shorts', slug: 'men-shorts' },
            { name: 'Activewear', slug: 'men-activewear' },
            { name: 'Swimwear', slug: 'men-swimwear' },
            { name: 'Underwear', slug: 'men-underwear' },
            { name: 'Suits', slug: 'men-suits' },
          ]
        },
        {
          name: 'Shoes',
          slug: 'men-shoes',
          children: [
            { name: 'Sneakers', slug: 'men-sneakers' },
            { name: 'Boots', slug: 'men-boots' },
            { name: 'Dress Shoes', slug: 'men-dress-shoes' },
            { name: 'Athletic Shoes', slug: 'men-athletic-shoes' },
            { name: 'Sandals', slug: 'men-sandals' },
            { name: 'Loafers', slug: 'men-loafers' },
          ]
        },
        {
          name: 'Accessories',
          slug: 'men-accessories',
          children: [
            { name: 'Bags', slug: 'men-bags' },
            { name: 'Backpacks', slug: 'men-backpacks' },
            { name: 'Belts', slug: 'men-belts' },
            { name: 'Hats', slug: 'men-hats' },
            { name: 'Sunglasses', slug: 'men-sunglasses' },
            { name: 'Ties', slug: 'men-ties' },
            { name: 'Watches', slug: 'men-watches' },
            { name: 'Wallets', slug: 'men-wallets' },
          ]
        }
      ]
    },
    {
      name: 'Kids',
      slug: 'kids',
      imageUrl: '/categories/kids.jpg',
      children: [
        {
          name: 'Girls (2-14 years)',
          slug: 'girls',
          children: [
            { name: 'Dresses', slug: 'girls-dresses' },
            { name: 'Tops', slug: 'girls-tops' },
            { name: 'Bottoms', slug: 'girls-bottoms' },
            { name: 'Outerwear', slug: 'girls-outerwear' },
            { name: 'Shoes', slug: 'girls-shoes' },
            { name: 'Accessories', slug: 'girls-accessories' },
          ]
        },
        {
          name: 'Boys (2-14 years)',
          slug: 'boys',
          children: [
            { name: 'Tops', slug: 'boys-tops' },
            { name: 'Bottoms', slug: 'boys-bottoms' },
            { name: 'Outerwear', slug: 'boys-outerwear' },
            { name: 'Shoes', slug: 'boys-shoes' },
            { name: 'Accessories', slug: 'boys-accessories' },
          ]
        },
        {
          name: 'Baby (0-24 months)',
          slug: 'baby',
          children: [
            { name: 'Baby Girl', slug: 'baby-girl' },
            { name: 'Baby Boy', slug: 'baby-boy' },
            { name: 'Unisex Baby', slug: 'baby-unisex' },
            { name: 'Baby Shoes', slug: 'baby-shoes' },
            { name: 'Baby Accessories', slug: 'baby-accessories' },
          ]
        }
      ]
    },
    {
      name: 'Designer',
      slug: 'designer',
      imageUrl: '/categories/designer.jpg',
      children: [
        {
          name: 'Luxury Brands',
          slug: 'luxury-brands',
          children: [
            { name: 'Louis Vuitton', slug: 'louis-vuitton' },
            { name: 'Chanel', slug: 'chanel' },
            { name: 'Gucci', slug: 'gucci' },
            { name: 'Prada', slug: 'prada' },
            { name: 'Hermès', slug: 'hermes' },
            { name: 'Dior', slug: 'dior' },
            { name: 'Saint Laurent', slug: 'saint-laurent' },
            { name: 'Balenciaga', slug: 'balenciaga' },
          ]
        },
        {
          name: 'Contemporary',
          slug: 'contemporary',
          children: [
            { name: 'Zara', slug: 'zara' },
            { name: 'COS', slug: 'cos' },
            { name: '& Other Stories', slug: 'other-stories' },
            { name: 'Acne Studios', slug: 'acne-studios' },
            { name: 'Ganni', slug: 'ganni' },
          ]
        }
      ]
    },
    {
      name: 'Vintage',
      slug: 'vintage',
      imageUrl: '/categories/vintage.jpg',
      children: [
        {
          name: 'By Decade',
          slug: 'by-decade',
          children: [
            { name: '2000s', slug: 'vintage-2000s' },
            { name: '1990s', slug: 'vintage-1990s' },
            { name: '1980s', slug: 'vintage-1980s' },
            { name: '1970s', slug: 'vintage-1970s' },
            { name: '1960s & Earlier', slug: 'vintage-1960s' },
          ]
        },
        {
          name: 'By Style',
          slug: 'vintage-style',
          children: [
            { name: 'Band T-shirts', slug: 'vintage-band-tees' },
            { name: 'Denim', slug: 'vintage-denim' },
            { name: 'Leather Jackets', slug: 'vintage-leather' },
            { name: 'Graphic Tees', slug: 'vintage-graphic-tees' },
            { name: 'Vintage Sportswear', slug: 'vintage-sportswear' },
          ]
        }
      ]
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      imageUrl: '/categories/home.jpg',
      children: [
        {
          name: 'Decor',
          slug: 'home-decor',
          children: [
            { name: 'Wall Art', slug: 'wall-art' },
            { name: 'Candles & Lighting', slug: 'candles-lighting' },
            { name: 'Plants & Planters', slug: 'plants-planters' },
            { name: 'Mirrors', slug: 'mirrors' },
            { name: 'Cushions & Throws', slug: 'cushions-throws' },
          ]
        },
        {
          name: 'Furniture',
          slug: 'furniture',
          children: [
            { name: 'Chairs', slug: 'chairs' },
            { name: 'Tables', slug: 'tables' },
            { name: 'Storage', slug: 'storage' },
            { name: 'Vintage Furniture', slug: 'vintage-furniture' },
          ]
        }
      ]
    },
    {
      name: 'Beauty',
      slug: 'beauty',
      imageUrl: '/categories/beauty.jpg',
      children: [
        {
          name: 'Makeup',
          slug: 'makeup',
          children: [
            { name: 'Foundation', slug: 'foundation' },
            { name: 'Lipstick', slug: 'lipstick' },
            { name: 'Eyeshadow', slug: 'eyeshadow' },
            { name: 'Mascara', slug: 'mascara' },
          ]
        },
        {
          name: 'Skincare',
          slug: 'skincare',
          children: [
            { name: 'Moisturizers', slug: 'moisturizers' },
            { name: 'Serums', slug: 'serums' },
            { name: 'Cleansers', slug: 'cleansers' },
            { name: 'Masks', slug: 'masks' },
          ]
        },
        {
          name: 'Fragrance',
          slug: 'fragrance',
          children: [
            { name: 'Perfume', slug: 'perfume' },
            { name: 'Body Spray', slug: 'body-spray' },
            { name: 'Travel Size', slug: 'travel-fragrance' },
          ]
        }
      ]
    }
  ];

  // Create categories recursively (only if they don't exist)
  async function createCategory(categoryData: any, parentId?: string) {
    const { children, ...categoryInfo } = categoryData;
    
    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: categoryInfo.slug }
    });

    let category;
    if (existingCategory) {
      category = existingCategory;
    } else {
      category = await prisma.category.create({
        data: {
          ...categoryInfo,
          parentId: parentId || null,
        },
      });
    }

    if (children) {
      for (const child of children) {
        await createCategory(child, category.id);
      }
    }

    return category;
  }

  // Create new category structure (only add missing ones)
  for (const category of categories) {
    await createCategory(category);
  }

  // Create test users if they don't exist
  const testUsers = [
    {
      clerkId: 'user_demo1',
      email: 'sofia@example.com',
      firstName: 'Sofia',
      lastName: 'Petrova',
      location: 'Sofia, Bulgaria',
      averageRating: 4.8,
      totalSales: 25
    },
    {
      clerkId: 'user_demo2', 
      email: 'maria@example.com',
      firstName: 'Maria',
      lastName: 'Dimitrova',
      location: 'Plovdiv, Bulgaria',
      averageRating: 4.6,
      totalSales: 18
    },
    {
      clerkId: 'user_demo3',
      email: 'ana@example.com', 
      firstName: 'Ana',
      lastName: 'Todorova',
      location: 'Varna, Bulgaria',
      averageRating: 4.9,
      totalSales: 32
    }
  ];

  const users = [];
  for (const userData of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.clerkId }
    });
    
    if (!existingUser) {
      const user = await prisma.user.create({
        data: userData
      });
      users.push(user);
    } else {
      users.push(existingUser);
    }
  }

  // Get some categories for products
  const womenClothing = await prisma.category.findFirst({
    where: { slug: 'women-dresses' }
  });
  const womenShoes = await prisma.category.findFirst({
    where: { slug: 'women-sneakers' }
  });
  const womenBags = await prisma.category.findFirst({
    where: { slug: 'women-handbags' }
  });
  const menClothing = await prisma.category.findFirst({
    where: { slug: 'men-tshirts' }
  });
  const menShoes = await prisma.category.findFirst({
    where: { slug: 'men-sneakers' }
  });

  // Sample products data
  const sampleProducts = [
    {
      title: 'Elegant Black Evening Dress',
      description: 'Beautiful black evening dress in excellent condition. Perfect for special occasions. Size S, worn only once.',
      price: 85.00,
      condition: 'VERY_GOOD',
      size: 'S',
      brand: 'Zara',
      color: 'Black',
      categoryId: womenClothing?.id,
      sellerId: users[0]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1566479179817-c0d04e9bc8c0?w=400', displayOrder: 0 },
        { imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', displayOrder: 1 }
      ]
    },
    {
      title: 'White Nike Air Force 1 Sneakers',
      description: 'Classic white Nike Air Force 1 sneakers. Lightly worn, great condition. Size 38 EU.',
      price: 65.00,
      condition: 'GOOD',
      size: '38',
      brand: 'Nike',
      color: 'White',
      categoryId: womenShoes?.id,
      sellerId: users[1]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400', displayOrder: 0 }
      ]
    },
    {
      title: 'Vintage Leather Handbag',
      description: 'Authentic vintage leather handbag in brown. Classic design that never goes out of style.',
      price: 120.00,
      condition: 'VERY_GOOD',
      size: 'One Size',
      brand: 'Coach',
      color: 'Brown',
      categoryId: womenBags?.id,
      sellerId: users[2]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', displayOrder: 0 }
      ]
    },
    {
      title: 'Graphic T-Shirt - Band Tee',
      description: 'Cool vintage-style band t-shirt. Size M, 100% cotton. Great for casual wear.',
      price: 25.00,
      condition: 'GOOD',
      size: 'M',
      brand: 'H&M',
      color: 'Black',
      categoryId: menClothing?.id,
      sellerId: users[0]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400', displayOrder: 0 }
      ]
    },
    {
      title: 'Adidas Ultraboost Running Shoes',
      description: 'Comfortable Adidas Ultraboost running shoes. Size 42 EU, worn a few times.',
      price: 95.00,
      condition: 'VERY_GOOD',
      size: '42',
      brand: 'Adidas',
      color: 'Grey',
      categoryId: menShoes?.id,
      sellerId: users[1]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', displayOrder: 0 }
      ]
    },
    {
      title: 'Designer Floral Summer Dress',
      description: 'Beautiful floral summer dress from a luxury brand. Size M, perfect condition.',
      price: 150.00,
      condition: 'NEW_WITH_TAGS',
      size: 'M',
      brand: 'Gucci',
      color: 'Floral',
      categoryId: womenClothing?.id,
      sellerId: users[2]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', displayOrder: 0 }
      ]
    },
    {
      title: 'Red High Heels',
      description: 'Stunning red high heels, perfect for special occasions. Size 37, minimal wear.',
      price: 75.00,
      condition: 'VERY_GOOD',
      size: '37',
      brand: 'Zara',
      color: 'Red',
      categoryId: womenShoes?.id,
      sellerId: users[0]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', displayOrder: 0 }
      ]
    },
    {
      title: 'Vintage Denim Jacket',
      description: 'Classic vintage denim jacket. Size L, authentic 90s style. Great quality.',
      price: 55.00,
      condition: 'GOOD',
      size: 'L',
      brand: "Levi's",
      color: 'Blue',
      categoryId: womenClothing?.id,
      sellerId: users[1]?.id,
      images: [
        { imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', displayOrder: 0 }
      ]
    }
  ];

  // Create products if they don't exist
  for (const productData of sampleProducts) {
    if (!productData.categoryId || !productData.sellerId) continue;
    
    const { images, ...productInfo } = productData;
    
    const existingProduct = await prisma.product.findFirst({
      where: { 
        title: productInfo.title,
        sellerId: productInfo.sellerId 
      }
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          ...productInfo,
          price: productInfo.price,
          status: 'AVAILABLE'
        }
      });

      // Add images
      for (const imageData of images) {
        await prisma.productImage.create({
          data: {
            ...imageData,
            productId: product.id
          }
        });
      }
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📦 Created ${sampleProducts.length} sample products`);
  console.log(`👥 Created ${testUsers.length} test users`);
  console.log(`🏷️ Created comprehensive category structure`);

}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });