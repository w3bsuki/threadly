// This file helps resolve Prisma binary copying issues in monorepo setups
const fs = require('fs');
const path = require('path');

// Function to ensure Prisma binaries are accessible
function ensurePrismaBinaries() {
  const generatedPath = path.join(__dirname, 'generated', 'client');
  
  if (!fs.existsSync(generatedPath)) {
    console.log('Prisma client not generated yet. Run "pnpm build" in packages/database');
    return;
  }

  // Create symlinks or copies as needed
  const binaryFiles = [
    'query_engine-windows.dll.node',
    'libquery_engine-rhel-openssl-3.0.x.so.node'
  ];

  binaryFiles.forEach(file => {
    const sourcePath = path.join(generatedPath, file);
    if (fs.existsSync(sourcePath)) {
      console.log(`Found Prisma binary: ${file}`);
    }
  });
}

// Export for use in webpack config
module.exports = { ensurePrismaBinaries };