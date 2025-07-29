#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * Next-Forge Migration Script
 * Automates the migration from 30 packages to 6 packages
 */

// Import path mappings for automated migration
const IMPORT_MAPPINGS: Record<string, string> = {
  // UI Package Mappings
  '@repo/design-system/components': '@repo/ui/components',
  '@repo/design-system/lib': '@repo/ui/lib',
  '@repo/design-system': '@repo/ui',
  '@repo/cart': '@repo/ui/components',
  '@repo/checkout': '@repo/ui/components',
  '@repo/messaging': '@repo/ui/components',
  
  // Utils Package Mappings
  '@repo/analytics': '@repo/utils/analytics',
  '@repo/api-utils': '@repo/utils/api',
  '@repo/database': '@repo/utils/cache',
  '@repo/cms': '@repo/utils/cms',
  '@repo/collaboration': '@repo/utils/collaboration',
  '@repo/commerce': '@repo/utils/commerce',
  '@repo/email': '@repo/utils/email',
  '@repo/error-handling': '@repo/utils/errors',
  '@repo/feature-flags': '@repo/utils/features',
  '@repo/internationalization': '@repo/utils/i18n',
  '@repo/notifications': '@repo/utils/notifications',
  '@repo/observability': '@repo/utils/observability',
  '@repo/payments': '@repo/utils/payments',
  '@repo/rate-limit': '@repo/utils/rate-limit',
  '@repo/real-time': '@repo/utils/realtime',
  '@repo/search': '@repo/utils/search',
  '@repo/security': '@repo/utils/security',
  '@repo/seo': '@repo/utils/seo',
  '@repo/server-actions': '@repo/utils/server',
  '@repo/webhooks': '@repo/utils/webhooks',
  
  // Config Package Mappings
  '@repo/next-config': '@repo/config/next',
  '@repo/typescript-config': '@repo/config/typescript',
};

// Package structure mapping
const PACKAGE_MIGRATIONS = {
  ui: {
    from: ['design-system', 'cart', 'checkout', 'messaging'],
    structure: {
      'src/components': ['components'],
      'src/lib': ['lib', 'hooks', 'utils'],
      'src/styles': ['styles'],
    }
  },
  utils: {
    from: [
      'analytics', 'api-utils', 'cache', 'cms', 'collaboration',
      'commerce', 'email', 'error-handling', 'feature-flags',
      'internationalization', 'notifications', 'observability',
      'payments', 'rate-limit', 'real-time', 'search',
      'security', 'seo', 'server-actions', 'webhooks'
    ],
    structure: {
      'src/analytics': ['analytics'],
      'src/api': ['api-utils'],
      'src/cache': ['cache'],
      'src/cms': ['cms'],
      'src/collaboration': ['collaboration'],
      'src/commerce': ['commerce'],
      'src/email': ['email'],
      'src/errors': ['error-handling'],
      'src/features': ['feature-flags'],
      'src/i18n': ['internationalization'],
      'src/notifications': ['notifications'],
      'src/observability': ['observability'],
      'src/payments': ['payments'],
      'src/rate-limit': ['rate-limit'],
      'src/realtime': ['real-time'],
      'src/search': ['search'],
      'src/security': ['security'],
      'src/seo': ['seo'],
      'src/server': ['server-actions'],
      'src/webhooks': ['webhooks'],
    }
  },
  config: {
    from: ['typescript-config', 'next-config'],
    structure: {
      'typescript': ['typescript-config'],
      'next': ['next-config'],
      'eslint': [], // Will copy from root
      'prettier': [], // Will copy from root
    }
  }
};

async function updateImportsInFile(filePath: string): Promise<boolean> {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Skip non-TypeScript/JavaScript files
    if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) {
      return false;
    }

    // Replace imports
    for (const [oldImport, newImport] of Object.entries(IMPORT_MAPPINGS)) {
      const regex = new RegExp(
        `(['"\`])${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`,
        'g'
      );
      
      if (content.match(regex)) {
        content = content.replace(regex, `$1${newImport}$2`);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content);
      console.log(`✅ Updated imports in: ${filePath}`);
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error);
    return false;
  }
}

async function createPackageStructure() {
  console.log('📁 Creating new package structure...');
  
  // Create base directories
  for (const [packageName, config] of Object.entries(PACKAGE_MIGRATIONS)) {
    const packagePath = path.join('packages', packageName);
    
    // Create package directory
    await fs.mkdir(packagePath, { recursive: true });
    
    // Create subdirectories
    for (const subdir of Object.keys(config.structure)) {
      await fs.mkdir(path.join(packagePath, subdir), { recursive: true });
    }
    
    console.log(`✅ Created structure for @repo/${packageName}`);
  }
}

async function createPackageJson(packageName: string, dependencies: string[]) {
  const packagePath = path.join('packages', packageName);
  
  const exports: Record<string, string> = {};
  const config = PACKAGE_MIGRATIONS[packageName as keyof typeof PACKAGE_MIGRATIONS];
  
  // Generate exports based on structure
  if (packageName === 'ui') {
    exports['./components'] = './src/components/index.ts';
    exports['./lib'] = './src/lib/index.ts';
    exports['./styles'] = './src/styles/globals.css';
  } else if (packageName === 'utils') {
    for (const subdir of Object.keys(config.structure)) {
      const exportName = subdir.replace('src/', './');
      exports[exportName] = `${subdir}/index.ts`;
    }
  } else if (packageName === 'config') {
    exports['./typescript'] = './typescript/base.json';
    exports['./next'] = './next/index.js';
    exports['./eslint'] = './eslint/index.js';
    exports['./prettier'] = './prettier/index.js';
  }
  
  const packageJson = {
    name: `@repo/${packageName}`,
    version: '0.0.0',
    private: true,
    type: packageName === 'config' ? 'commonjs' : 'module',
    exports,
    dependencies: {} as Record<string, string>,
    devDependencies: {} as Record<string, string>,
  };
  
  // TODO: Merge dependencies from source packages
  
  await fs.writeFile(
    path.join(packagePath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  console.log(`✅ Created package.json for @repo/${packageName}`);
}

async function createIndexFiles() {
  console.log('📝 Creating index files...');
  
  // UI package index files
  const uiComponents = [
    'cart', 'checkout', 'messaging', 'navigation',
    'product', 'auth', 'common'
  ];
  
  const uiComponentsIndex = uiComponents
    .map(comp => `export * from './${comp}';`)
    .join('\n');
  
  await fs.writeFile(
    'packages/ui/src/components/index.ts',
    uiComponentsIndex
  );
  
  // Utils package index files
  for (const [subdir, sources] of Object.entries(PACKAGE_MIGRATIONS.utils.structure)) {
    const indexPath = path.join('packages/utils', subdir, 'index.ts');
    const indexContent = `// Auto-generated index file\nexport * from './client';\nexport * from './server';\n`;
    
    await fs.writeFile(indexPath, indexContent);
  }
  
  console.log('✅ Created index files');
}

async function updateTsConfig() {
  console.log('🔧 Updating TypeScript configurations...');
  
  const rootTsConfig = {
    compilerOptions: {
      paths: {
        '@repo/ui/*': ['./packages/ui/src/*'],
        '@repo/utils/*': ['./packages/utils/src/*'],
        '@repo/config/*': ['./packages/config/*'],
        '@repo/auth/*': ['./packages/auth/*'],
        '@repo/database/*': ['./packages/database/*'],
        '@repo/validation/*': ['./packages/validation/*'],
      }
    }
  };
  
  // Update root tsconfig
  const currentConfig = JSON.parse(
    await fs.readFile('tsconfig.json', 'utf-8')
  );
  
  currentConfig.compilerOptions.paths = {
    ...currentConfig.compilerOptions.paths,
    ...rootTsConfig.compilerOptions.paths,
  };
  
  await fs.writeFile(
    'tsconfig.json',
    JSON.stringify(currentConfig, null, 2)
  );
  
  console.log('✅ Updated TypeScript configuration');
}

async function updateAllImports() {
  console.log('🔄 Updating imports across codebase...');
  
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      '.turbo/**',
      'scripts/migrate-to-next-forge.ts'
    ]
  });
  
  let updatedCount = 0;
  
  for (const file of files) {
    if (await updateImportsInFile(file)) {
      updatedCount++;
    }
  }
  
  console.log(`✅ Updated imports in ${updatedCount} files`);
}

async function main() {
  console.log('🚀 Starting Next-Forge migration...\n');
  
  try {
    // Step 1: Create new package structure
    await createPackageStructure();
    
    // Step 2: Create package.json files
    for (const packageName of Object.keys(PACKAGE_MIGRATIONS)) {
      await createPackageJson(packageName, []);
    }
    
    // Step 3: Create index files
    await createIndexFiles();
    
    // Step 4: Update TypeScript configuration
    await updateTsConfig();
    
    // Step 5: Update all imports
    await updateAllImports();
    
    console.log('\n✅ Migration preparation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: pnpm install');
    console.log('2. Run: pnpm typecheck');
    console.log('3. Manually move package contents to new structure');
    console.log('4. Run: pnpm build');
    console.log('5. Test thoroughly before removing old packages');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}