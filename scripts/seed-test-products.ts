import { database } from '../packages/database/index.js';

async function seedTestProducts() {
  console.log('🌱 Starting seed process...');
  
  try {
    // First, check if we have users and categories
    const userCount = await database.user.count();
    const categoryCount = await database.category.count();
    
    console.log(`Found ${userCount} users and ${categoryCount} categories`);
    
    if (userCount === 0) {
      console.error('❌ No users found. Please create a user account first.');
      process.exit(1);
    }
    
    if (categoryCount === 0) {
      console.log('📁 Creating default categories...');
      
      const categories = [
        { name: 'Clothing', slug: 'clothing' },
        { name: 'Shoes', slug: 'shoes' },
        { name: 'Accessories', slug: 'accessories' },
        { name: 'Bags', slug: 'bags' },
      ];
      
      for (const cat of categories) {
        await database.category.create({ data: cat });
      }
      
      console.log('✅ Categories created');
    }
    
    // Get a user to be the seller
    const seller = await database.user.findFirst();
    if (!seller) {
      console.error('❌ No seller found');
      process.exit(1);
    }
    
    // Get categories
    const clothingCategory = await database.category.findFirst({
      where: { slug: 'clothing' }
    });
    
    console.log(`Using seller: ${seller.firstName} ${seller.lastName} (${seller.id})`);
    
    // Create test products
    const testProducts = [
      {
        title: 'Vintage Denim Jacket',
        description: 'Classic 90s denim jacket in excellent condition. Light wash with minimal fading.',
        price: 89.99,
        brand: 'Levi\'s',
        size: 'M',
        color: 'Blue',
        condition: 'EXCELLENT',
        categoryId: clothingCategory?.id,
        sellerId: seller.id,
        status: 'AVAILABLE',
      },
      {
        title: 'Designer Leather Handbag',
        description: 'Authentic leather handbag, barely used. Comes with dust bag and authenticity card.',
        price: 299.99,
        brand: 'Coach',
        size: 'One Size',
        color: 'Black',
        condition: 'LIKE_NEW',
        categoryId: clothingCategory?.id,
        sellerId: seller.id,
        status: 'AVAILABLE',
      },
      {
        title: 'Retro Sneakers',
        description: 'Rare vintage sneakers from the 80s. Some signs of wear but still in great shape.',
        price: 150.00,
        brand: 'Nike',
        size: '10',
        color: 'White/Red',
        condition: 'GOOD',
        categoryId: clothingCategory?.id,
        sellerId: seller.id,
        status: 'AVAILABLE',
      },
    ];
    
    console.log('🛍️ Creating test products...');
    
    for (const productData of testProducts) {
      const product = await database.product.create({
        data: productData,
      });
      
      // Add a sample image for each product
      await database.productImage.create({
        data: {
          productId: product.id,
          imageUrl: `https://via.placeholder.com/600x800?text=${encodeURIComponent(productData.title)}`,
          alt: productData.title,
          displayOrder: 0,
        }
      });
      
      console.log(`✅ Created: ${product.title}`);
    }
    
    // Get final counts
    const finalProductCount = await database.product.count();
    const availableCount = await database.product.count({
      where: { status: 'AVAILABLE' }
    });
    
    console.log(`\n🎉 Seed completed!`);
    console.log(`Total products: ${finalProductCount}`);
    console.log(`Available products: ${availableCount}`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seedTestProducts()
  .then(() => {
    console.log('✅ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });