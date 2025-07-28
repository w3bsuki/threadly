#!/usr/bin/env node

import { readFileSync, statSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Design System Migration Script
 *
 * This script helps automate the migration from hardcoded values to design system tokens.
 * It can be run on individual files or entire directories.
 *
 * Usage:
 *   pnpm tsx scripts/migrate-to-design-system.ts [options] <path>
 *
 * Options:
 *   --dry-run    Show what would be changed without modifying files
 *   --verbose    Show detailed migration information
 *   --force      Override safety checks
 */

interface MigrationRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  description: string;
  category: 'color' | 'spacing' | 'typography' | 'border' | 'shadow';
}

// Color migration rules
const colorMigrations: MigrationRule[] = [
  // Tailwind color classes
  {
    pattern: /\bbg-black\b/g,
    replacement: 'bg-primary',
    description: 'Black background → Primary',
    category: 'color',
  },
  {
    pattern: /\bbg-white\b/g,
    replacement: 'bg-background',
    description: 'White background → Background',
    category: 'color',
  },
  {
    pattern: /\btext-black\b/g,
    replacement: 'text-foreground',
    description: 'Black text → Foreground',
    category: 'color',
  },
  {
    pattern: /\btext-white\b/g,
    replacement: 'text-background',
    description: 'White text → Background',
    category: 'color',
  },

  // Gray scale
  {
    pattern: /\bbg-gray-50\b/g,
    replacement: 'bg-muted',
    description: 'Gray 50 → Muted',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-100\b/g,
    replacement: 'bg-secondary',
    description: 'Gray 100 → Secondary',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-200\b/g,
    replacement: 'bg-accent',
    description: 'Gray 200 → Accent',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-300\b/g,
    replacement: 'bg-border',
    description: 'Gray 300 → Border',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-400\b/g,
    replacement: 'bg-muted-foreground/20',
    description: 'Gray 400 → Muted Foreground 20%',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-500\b/g,
    replacement: 'bg-muted-foreground/50',
    description: 'Gray 500 → Muted Foreground 50%',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-600\b/g,
    replacement: 'bg-muted-foreground',
    description: 'Gray 600 → Muted Foreground',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-700\b/g,
    replacement: 'bg-secondary-foreground',
    description: 'Gray 700 → Secondary Foreground',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-800\b/g,
    replacement: 'bg-primary/90',
    description: 'Gray 800 → Primary 90%',
    category: 'color',
  },
  {
    pattern: /\bbg-gray-900\b/g,
    replacement: 'bg-primary',
    description: 'Gray 900 → Primary',
    category: 'color',
  },

  // Text colors
  {
    pattern: /\btext-gray-400\b/g,
    replacement: 'text-muted-foreground/70',
    description: 'Gray 400 text → Muted 70%',
    category: 'color',
  },
  {
    pattern: /\btext-gray-500\b/g,
    replacement: 'text-muted-foreground',
    description: 'Gray 500 text → Muted Foreground',
    category: 'color',
  },
  {
    pattern: /\btext-gray-600\b/g,
    replacement: 'text-muted-foreground',
    description: 'Gray 600 text → Muted Foreground',
    category: 'color',
  },
  {
    pattern: /\btext-gray-700\b/g,
    replacement: 'text-secondary-foreground',
    description: 'Gray 700 text → Secondary Foreground',
    category: 'color',
  },
  {
    pattern: /\btext-gray-800\b/g,
    replacement: 'text-foreground/90',
    description: 'Gray 800 text → Foreground 90%',
    category: 'color',
  },
  {
    pattern: /\btext-gray-900\b/g,
    replacement: 'text-foreground',
    description: 'Gray 900 text → Foreground',
    category: 'color',
  },

  // Hex colors in className
  {
    pattern: /className="([^"]*)(#[0-9a-fA-F]{6})([^"]*)"/g,
    replacement: (match) => {
      console.warn(
        `Found hex color in className: ${match} - Manual migration required`
      );
      return match;
    },
    description: 'Hex colors need manual migration',
    category: 'color',
  },

  // RGB/RGBA colors
  {
    pattern: /rgba?\([^)]+\)/g,
    replacement: (match) => {
      console.warn(`Found RGB color: ${match} - Manual migration required`);
      return match;
    },
    description: 'RGB colors need manual migration',
    category: 'color',
  },
];

// Spacing migration rules (for style props)
const spacingMigrations: MigrationRule[] = [
  // Common pixel values to spacing tokens
  {
    pattern: /padding:\s*["']?4px["']?/g,
    replacement: 'padding: "var(--space-1)"',
    description: '4px → space-1',
    category: 'spacing',
  },
  {
    pattern: /padding:\s*["']?8px["']?/g,
    replacement: 'padding: "var(--space-2)"',
    description: '8px → space-2',
    category: 'spacing',
  },
  {
    pattern: /padding:\s*["']?12px["']?/g,
    replacement: 'padding: "var(--space-3)"',
    description: '12px → space-3',
    category: 'spacing',
  },
  {
    pattern: /padding:\s*["']?16px["']?/g,
    replacement: 'padding: "var(--space-4)"',
    description: '16px → space-4',
    category: 'spacing',
  },
  {
    pattern: /padding:\s*["']?20px["']?/g,
    replacement: 'padding: "var(--space-5)"',
    description: '20px → space-5',
    category: 'spacing',
  },
  {
    pattern: /padding:\s*["']?24px["']?/g,
    replacement: 'padding: "var(--space-6)"',
    description: '24px → space-6',
    category: 'spacing',
  },
  {
    pattern: /padding:\s*["']?32px["']?/g,
    replacement: 'padding: "var(--space-8)"',
    description: '32px → space-8',
    category: 'spacing',
  },

  // Margin
  {
    pattern: /margin:\s*["']?4px["']?/g,
    replacement: 'margin: "var(--space-1)"',
    description: '4px → space-1',
    category: 'spacing',
  },
  {
    pattern: /margin:\s*["']?8px["']?/g,
    replacement: 'margin: "var(--space-2)"',
    description: '8px → space-2',
    category: 'spacing',
  },
  {
    pattern: /margin:\s*["']?16px["']?/g,
    replacement: 'margin: "var(--space-4)"',
    description: '16px → space-4',
    category: 'spacing',
  },
  {
    pattern: /margin:\s*["']?24px["']?/g,
    replacement: 'margin: "var(--space-6)"',
    description: '24px → space-6',
    category: 'spacing',
  },

  // Gap
  {
    pattern: /gap:\s*["']?8px["']?/g,
    replacement: 'gap: "var(--space-2)"',
    description: '8px → space-2',
    category: 'spacing',
  },
  {
    pattern: /gap:\s*["']?16px["']?/g,
    replacement: 'gap: "var(--space-4)"',
    description: '16px → space-4',
    category: 'spacing',
  },
  {
    pattern: /gap:\s*["']?24px["']?/g,
    replacement: 'gap: "var(--space-6)"',
    description: '24px → space-6',
    category: 'spacing',
  },
];

// Border radius migrations
const borderMigrations: MigrationRule[] = [
  {
    pattern: /\brounded-none\b/g,
    replacement: 'rounded-[var(--radius-none)]',
    description: 'None → radius-none',
    category: 'border',
  },
  {
    pattern: /\brounded-sm\b/g,
    replacement: 'rounded-[var(--radius-sm)]',
    description: 'Small → radius-sm',
    category: 'border',
  },
  {
    pattern: /\brounded\b(?!-)/g,
    replacement: 'rounded-[var(--radius-md)]',
    description: 'Default → radius-md',
    category: 'border',
  },
  {
    pattern: /\brounded-md\b/g,
    replacement: 'rounded-[var(--radius-md)]',
    description: 'Medium → radius-md',
    category: 'border',
  },
  {
    pattern: /\brounded-lg\b/g,
    replacement: 'rounded-[var(--radius-lg)]',
    description: 'Large → radius-lg',
    category: 'border',
  },
  {
    pattern: /\brounded-xl\b/g,
    replacement: 'rounded-[var(--radius-xl)]',
    description: 'XL → radius-xl',
    category: 'border',
  },
  {
    pattern: /\brounded-2xl\b/g,
    replacement: 'rounded-[var(--radius-2xl)]',
    description: '2XL → radius-2xl',
    category: 'border',
  },
  {
    pattern: /\brounded-full\b/g,
    replacement: 'rounded-[var(--radius-full)]',
    description: 'Full → radius-full',
    category: 'border',
  },
];

interface MigrationResult {
  file: string;
  changes: Array<{
    line: number;
    original: string;
    migrated: string;
    rule: MigrationRule;
  }>;
  warnings: string[];
}

function migrateFile(filePath: string, dryRun = false): MigrationResult {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result: MigrationResult = {
    file: filePath,
    changes: [],
    warnings: [],
  };

  let migratedContent = content;
  const allRules = [
    ...colorMigrations,
    ...spacingMigrations,
    ...borderMigrations,
  ];

  // Apply each migration rule
  allRules.forEach((rule) => {
    const matches = content.matchAll(rule.pattern);

    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const originalLine = lines[lineNumber - 1];

      if (typeof rule.replacement === 'string') {
        migratedContent = migratedContent.replace(
          rule.pattern,
          rule.replacement
        );

        result.changes.push({
          line: lineNumber,
          original: originalLine.trim(),
          migrated: originalLine.replace(rule.pattern, rule.replacement).trim(),
          rule,
        });
      }
    }
  });

  // Check for potential issues
  if (content.includes('style={{') || content.includes('style={{')) {
    result.warnings.push(
      'File contains inline styles that may need manual migration'
    );
  }

  if (content.includes('#') && /#[0-9a-fA-F]{6}/.test(content)) {
    result.warnings.push(
      'File contains hex color values that need manual migration'
    );
  }

  // Write the migrated content
  if (!dryRun && result.changes.length > 0) {
    writeFileSync(filePath, migratedContent);
  }

  return result;
}

function migrateDirectory(dirPath: string, dryRun = false): MigrationResult[] {
  const results: MigrationResult[] = [];
  const files = glob.sync(`${dirPath}/**/*.{tsx,jsx,ts,js,css}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  });

  files.forEach((file) => {
    const result = migrateFile(file, dryRun);
    if (result.changes.length > 0 || result.warnings.length > 0) {
      results.push(result);
    }
  });

  return results;
}

function printResults(results: MigrationResult[], verbose = false) {
  console.log('\n🎨 Design System Migration Report\n');

  const totalChanges = results.reduce((sum, r) => sum + r.changes.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  console.log('📊 Summary:');
  console.log(`   Files analyzed: ${results.length}`);
  console.log(`   Total changes: ${totalChanges}`);
  console.log(`   Total warnings: ${totalWarnings}`);
  console.log('');

  results.forEach((result) => {
    if (result.changes.length === 0 && result.warnings.length === 0) return;

    console.log(`\n📄 ${result.file}`);

    if (result.changes.length > 0) {
      console.log(`   ✏️  ${result.changes.length} changes`);

      if (verbose) {
        result.changes.forEach((change) => {
          console.log(`      Line ${change.line}: ${change.rule.description}`);
          console.log(`      - ${change.original}`);
          console.log(`      + ${change.migrated}`);
        });
      }
    }

    if (result.warnings.length > 0) {
      console.log(`   ⚠️  ${result.warnings.length} warnings`);
      result.warnings.forEach((warning) => {
        console.log(`      - ${warning}`);
      });
    }
  });

  // Category breakdown
  const categoryBreakdown = results
    .flatMap((r) => r.changes)
    .reduce(
      (acc, change) => {
        acc[change.rule.category] = (acc[change.rule.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  console.log('\n📈 Changes by Category:');
  Object.entries(categoryBreakdown).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}`);
  });
}

// CLI
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose');
const force = args.includes('--force');
const targetPath = args.find((arg) => !arg.startsWith('--')) || '.';

console.log('🚀 Starting Design System Migration...\n');

if (dryRun) {
  console.log('   Mode: DRY RUN (no files will be modified)\n');
}

try {
  const stats = statSync(targetPath);
  let results: MigrationResult[];

  if (stats.isDirectory()) {
    results = migrateDirectory(targetPath, dryRun);
  } else {
    results = [migrateFile(targetPath, dryRun)];
  }

  printResults(results, verbose);

  if (!dryRun && results.length > 0) {
    console.log('\n✅ Migration complete! Files have been updated.');
    console.log('   Run your tests to ensure everything works correctly.');
  }
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
