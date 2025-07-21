#!/usr/bin/env tsx

import { database } from '@repo/database';

async function checkDatabase() {
  
  try {
    // Check connection
    await database.$connect();
    
    // Check data counts
    const stats = {
      users: await database.user.count(),
      products: await database.product.count(),
      categories: await database.category.count(),
      orders: await database.order.count(),
      reviews: await database.review.count(),
      messages: await database.message.count(),
    };
    
    Object.entries(stats).forEach(([table, count]) => {
      const icon = count > 0 ? '✓' : '✗';
    });
    
    // Check for available products specifically
    const availableProducts = await database.product.count({
      where: { status: 'AVAILABLE' }
    });
    
    // Sample some products if they exist
    if (stats.products > 0) {
      const sampleProducts = await database.product.findMany({
        take: 3,
        include: {
          images: true,
          category: true,
        }
      });
      
      sampleProducts.forEach(p => {
      });
    }
    
    await database.$disconnect();
    
    // Provide diagnosis
    if (stats.products === 0) {
    } else if (availableProducts === 0) {
    } else {
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

checkDatabase();