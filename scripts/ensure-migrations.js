#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function ensureMigrations() {
  const migrationsDir = path.join(
    __dirname,
    '../packages/database/prisma/migrations'
  );

  console.log('🔄 Checking migration status...');

  try {
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log('❌ Migrations directory not found');
      process.exit(1);
    }

    // List all migration files
    const migrations = fs
      .readdirSync(migrationsDir)
      .filter((dir) => dir.match(/^\d{8}_/))
      .sort();

    console.log(`📁 Found ${migrations.length} migrations:`);
    migrations.forEach((migration) => {
      console.log(`  - ${migration}`);
    });

    // Validate schema
    console.log('\n🔍 Validating Prisma schema...');
    execSync('npx prisma validate', {
      cwd: path.join(__dirname, '../packages/database'),
      stdio: 'inherit',
    });

    // Generate client
    console.log('\n⚙️ Generating Prisma client...');
    execSync('npx prisma generate', {
      cwd: path.join(__dirname, '../packages/database'),
      stdio: 'inherit',
    });

    console.log('✅ Migration checks completed successfully');
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    process.exit(1);
  }
}

// Run when called directly
if (require.main === module) {
  ensureMigrations().catch(console.error);
}

module.exports = { ensureMigrations };
