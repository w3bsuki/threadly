#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get all package directories
const packagesDir = './packages';
const packages = fs.readdirSync(packagesDir)
  .filter(dir => fs.statSync(path.join(packagesDir, dir)).isDirectory());

console.log('Checking cross-package dependencies...\n');

const issues = [];

packages.forEach(pkg => {
  const pkgPath = path.join(packagesDir, pkg);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  
  if (!fs.existsSync(pkgJsonPath)) return;
  
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const declaredDeps = {
    ...pkgJson.dependencies || {},
    ...pkgJson.devDependencies || {},
    ...pkgJson.peerDependencies || {}
  };
  
  // Find all imports in this package
  try {
    const imports = execSync(
      `find ${pkgPath} -name "*.ts" -o -name "*.tsx" | xargs grep -h "from '@repo/" 2>/dev/null || true`,
      { encoding: 'utf-8' }
    )
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const match = line.match(/from ['"](@repo\/[^'"]+)['"]/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
      .map(imp => {
        // Get just the package name (e.g., @repo/design-system from @repo/design-system/components)
        const parts = imp.split('/');
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : imp;
      })
      .filter(imp => imp !== '@repo/typescript-config'); // Ignore typescript-config
    
    const uniqueImports = [...new Set(imports)];
    
    // Check if each import is declared as a dependency
    uniqueImports.forEach(imp => {
      if (!declaredDeps[imp]) {
        issues.push({
          package: pkg,
          missing: imp,
          count: imports.filter(i => i === imp).length
        });
      }
    });
  } catch (e) {
    // Ignore errors
  }
});

if (issues.length === 0) {
  console.log('✅ All cross-package dependencies are properly declared!');
} else {
  console.log(`Found ${issues.length} missing dependencies:\n`);
  
  // Group by package
  const byPackage = {};
  issues.forEach(issue => {
    if (!byPackage[issue.package]) {
      byPackage[issue.package] = [];
    }
    byPackage[issue.package].push(issue);
  });
  
  Object.entries(byPackage).forEach(([pkg, issues]) => {
    console.log(`\n📦 ${pkg}:`);
    issues.forEach(issue => {
      console.log(`  - Missing: ${issue.missing} (used ${issue.count} times)`);
    });
  });
  
  console.log('\n💡 To fix, add these dependencies to the respective package.json files.');
}