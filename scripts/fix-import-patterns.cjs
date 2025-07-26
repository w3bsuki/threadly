const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of common relative imports to @repo imports
const importMappings = {
  // Components in web app
  '../components/': '@repo/design-system/components',
  '../../components/': '@repo/design-system/components',
  '../../../components/': '@repo/design-system/components',
  
  // Lib imports
  '../lib/hooks/': '@repo/utils/hooks',
  '../../lib/hooks/': '@repo/utils/hooks',
  '../../../lib/hooks/': '@repo/utils/hooks',
  '../lib/stores/': '@repo/commerce',
  '../../lib/stores/': '@repo/commerce',
  
  // Database imports
  '../../../packages/database': '@repo/database',
  '../../../../packages/database': '@repo/database',
  
  // Utils imports
  '../lib/utils/': '@repo/utils',
  '../../lib/utils/': '@repo/utils',
  '../../../lib/utils/': '@repo/utils',
};

// Specific file mappings
const specificMappings = {
  'cart-store': '@repo/commerce',
  'use-debounce': '@repo/utils/hooks',
  'use-search': '@repo/utils/hooks',
  'currency': '@repo/utils',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Skip if it's a test file
  if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
    return false;
  }
  
  // Find all import statements
  const importRegex = /import\s+(?:{[^}]+}|[^;]+)\s+from\s+['"]([^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if already using @repo pattern
    if (importPath.startsWith('@repo/') || importPath.startsWith('@/')) {
      return match;
    }
    
    // Skip external packages
    if (!importPath.startsWith('.')) {
      return match;
    }
    
    // Check for specific file mappings
    for (const [file, repoImport] of Object.entries(specificMappings)) {
      if (importPath.includes(file)) {
        modified = true;
        return match.replace(importPath, repoImport);
      }
    }
    
    // Check for general path mappings
    for (const [relativePath, repoImport] of Object.entries(importMappings)) {
      if (importPath.startsWith(relativePath)) {
        modified = true;
        const newPath = importPath.replace(relativePath, repoImport + '/');
        return match.replace(importPath, newPath);
      }
    }
    
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
    return true;
  }
  
  return false;
}

function fixImports(directory) {
  const files = glob.sync(path.join(directory, '**/*.{ts,tsx}'), {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
  });
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (processFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\nFixed imports in ${fixedCount} files in ${directory}`);
  return fixedCount;
}

// Fix imports in both apps
console.log('Fixing import patterns...\n');

const webFixed = fixImports(path.join(__dirname, '../apps/web'));
const appFixed = fixImports(path.join(__dirname, '../apps/app'));

console.log(`\nTotal files fixed: ${webFixed + appFixed}`);
console.log('\nNote: This script handles common patterns. Some imports may need manual review.');