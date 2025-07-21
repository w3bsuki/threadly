#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run migrate
const { execSync } = require('child_process');

console.log('🔧 Running migrations with environment loaded...\n');

try {
  execSync('pnpm migrate', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ Migrations completed!');
} catch (error) {
  console.error('❌ Migration failed');
  process.exit(1);
}