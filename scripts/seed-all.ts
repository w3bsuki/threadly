#!/usr/bin/env tsx

// Seed all data needed for the marketplace
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Seed categories first
  execSync('tsx scripts/seed-categories.ts', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
  });

  // Then seed products
  execSync('tsx scripts/seed-products.ts', {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
  });
} catch (error) {
  console.error('\n❌ Seeding failed:', error);
  process.exit(1);
}
