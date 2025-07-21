#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const APPS_DIR = path.join(ROOT_DIR, 'apps');

// Files already migrated in Phase 1
const PHASE1_MIGRATED = [
  'apps/web/components/navigation/integrated-filters.tsx',
  'apps/web/components/navigation/components/user-actions.tsx',
  'apps/web/app/[locale]/styles.css',
  'apps/web/components/navigation/unified-bottom-nav.tsx',
  'apps/web/app/[locale]/product/[id]/components/product-detail.tsx',
  'apps/web/app/[locale]/components/product-quick-view/desktop-view.tsx',
  'apps/web/components/product-grid-client.tsx',
  'apps/web/app/[locale]/messages/components/messages-content.tsx',
  'apps/web/app/[locale]/search/components/search-results.tsx',
  'apps/web/app/[locale]/components/footer.tsx'
];

function findTsxFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir);
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules, .next, dist, etc.
          if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist' && entry !== '.next' && entry !== 'storybook-static') {
            traverse(fullPath);
          }
        } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
          const relativePath = path.relative(ROOT_DIR, fullPath);
          // Only include source files, not build artifacts
          if (!relativePath.includes('storybook-static') && !relativePath.includes('.next') && !relativePath.includes('node_modules')) {
            files.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  traverse(dir);
  return files;
}

function countViolations(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let violations = 0;

    // Color violations
    const hexColors = content.match(/#[0-9a-fA-F]{3,8}/g) || [];
    violations += hexColors.length;

    // Hardcoded color classes (not using semantic tokens)
    const hardcodedColors = [
      /bg-gray-\d+/g,
      /text-gray-\d+/g,
      /border-gray-\d+/g,
      /bg-white(?!\s*\/)/g,
      /bg-black(?!\s*\/)/g,
      /text-white(?!\s*\/)/g,
      /text-black(?!\s*\/)/g,
      /hover:bg-gray-\d+/g,
      /focus:bg-gray-\d+/g,
    ];

    hardcodedColors.forEach(pattern => {
      const matches = content.match(pattern) || [];
      violations += matches.length;
    });

    // RGBA patterns
    const rgbaPattern = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/g;
    const rgbaMatches = content.match(rgbaPattern) || [];
    violations += rgbaMatches.length;

    return violations;
  } catch (error) {
    return 0;
  }
}

async function main() {
  console.log('🔍 Phase 2 Design System Audit\n');
  
  const files = findTsxFiles(APPS_DIR);
  const fileViolations: Array<{ file: string; violations: number }> = [];
  
  for (const file of files) {
    const fullPath = path.join(ROOT_DIR, file);
    const violations = countViolations(fullPath);
    
    if (violations > 0 && !PHASE1_MIGRATED.includes(file)) {
      fileViolations.push({ file, violations });
    }
  }
  
  // Sort by violation count
  fileViolations.sort((a, b) => b.violations - a.violations);
  
  // Categorize files
  const phase2Files = fileViolations.filter(f => f.violations >= 20 && f.violations <= 60);
  const phase3Files = fileViolations.filter(f => f.violations < 20);
  const highPriorityFiles = fileViolations.filter(f => f.violations > 60);
  
  console.log('📊 Phase 2 Target Files (20-60 violations):');
  console.log('='.repeat(50));
  
  if (phase2Files.length === 0) {
    console.log('✅ No medium-priority files found! Moving to Phase 3...\n');
  } else {
    phase2Files.slice(0, 15).forEach(({ file, violations }) => {
      console.log(`  ${file.padEnd(80)} ${violations} violations`);
    });
    
    if (phase2Files.length > 15) {
      console.log(`  ... and ${phase2Files.length - 15} more files`);
    }
  }
  
  console.log(`\n📈 Summary:`);
  console.log(`  Phase 2 files (20-60 violations): ${phase2Files.length}`);
  console.log(`  Phase 3 files (<20 violations): ${phase3Files.length}`);
  console.log(`  High-priority files (>60 violations): ${highPriorityFiles.length}`);
  
  if (highPriorityFiles.length > 0) {
    console.log(`\n⚠️  High-priority files still need attention:`);
    highPriorityFiles.slice(0, 5).forEach(({ file, violations }) => {
      console.log(`  ${file.padEnd(80)} ${violations} violations`);
    });
  }
  
  console.log('\n🎯 Recommended Phase 2 targets:');
  console.log('='.repeat(50));
  
  // Focus on form, modal, and component files for Phase 2
  const formFiles = phase2Files.filter(f => 
    f.file.includes('form') || 
    f.file.includes('input') || 
    f.file.includes('modal') ||
    f.file.includes('dialog') ||
    f.file.includes('sheet') ||
    f.file.includes('popover') ||
    f.file.includes('card') ||
    f.file.includes('button')
  );
  
  if (formFiles.length > 0) {
    formFiles.slice(0, 10).forEach(({ file, violations }) => {
      console.log(`  ${file.padEnd(80)} ${violations} violations`);
    });
  } else {
    // If no specific form/modal files, show top Phase 2 files
    phase2Files.slice(0, 10).forEach(({ file, violations }) => {
      console.log(`  ${file.padEnd(80)} ${violations} violations`);
    });
  }
}

main().catch(console.error);