#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Now run the seed scripts
const { execSync } = require('child_process');

console.log('🌱 Seeding database with environment loaded...\n');

try {
  // Seed categories
  console.log('📁 Seeding categories...');
  execSync('npx tsx scripts/seed-categories.ts', { 
    stdio: 'inherit',
    env: process.env
  });
  
  // Seed products
  console.log('\n📦 Seeding products...');
  execSync('npx tsx scripts/seed-products.ts', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ Database seeded successfully!');
} catch (error) {
  console.error('❌ Seeding failed');
  process.exit(1);
}