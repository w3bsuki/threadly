import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

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
      console.log(`⏭️  Category already exists: ${categoryInfo.name}`);
      category = existingCategory;
    } else {
      category = await prisma.category.create({
        data: {
          ...categoryInfo,
          parentId: parentId || null,
        },
      });
      console.log(`✅ Created category: ${categoryInfo.name}`);
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

  console.log('🎉 Database seeding completed!');
  console.log(`📊 Created ${await prisma.category.count()} categories total`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });