#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Fixing Prisma setup for monorepo...\n');

// Step 1: Generate Prisma client
console.log('1️⃣ Generating Prisma client...');
try {
  execSync('npm run build', {
    cwd: path.join(__dirname, '../packages/database'),
    stdio: 'inherit'
  });
  console.log('✅ Prisma client generated successfully\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Step 2: Verify generated files
console.log('2️⃣ Verifying generated files...');
const generatedPath = path.join(__dirname, '../packages/database/generated/client');
const requiredFiles = ['index.js', 'index.d.ts'];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(generatedPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing. Please check the Prisma generation.');
  process.exit(1);
}

// Step 3: Create symlink for better Next.js integration (optional)
console.log('\n3️⃣ Setting up for Next.js integration...');

// Add .env.local if it doesn't exist
const envLocalPath = path.join(__dirname, '../apps/web/.env.local');
if (!fs.existsSync(envLocalPath)) {
  const envContent = `# Prisma configuration
PRISMA_QUERY_ENGINE_LIBRARY="${path.join(generatedPath, 'query_engine-windows.dll.node').replace(/\\/g, '/')}"
`;
  fs.writeFileSync(envLocalPath, envContent);
  console.log('✅ Created .env.local with Prisma configuration');
} else {
  console.log('ℹ️  .env.local already exists');
}

console.log('\n✨ Prisma setup completed successfully!');
console.log('\n📝 Notes:');
console.log('- The Prisma client is generated at: packages/database/generated/client');
console.log('- Import from @repo/database in your code');
console.log('- If you still see errors, try restarting your dev server');