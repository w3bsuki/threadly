import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

// Define the design system violations we're looking for
const violations = [
  // Colors
  {
    pattern: /bg-white(?![a-z-])/g,
    replacement: 'bg-background',
    type: 'color',
  },
  { pattern: /bg-gray-50(?![a-z-])/g, replacement: 'bg-muted', type: 'color' },
  {
    pattern: /bg-gray-100(?![a-z-])/g,
    replacement: 'bg-secondary',
    type: 'color',
  },
  {
    pattern: /bg-gray-200(?![a-z-])/g,
    replacement: 'bg-accent',
    type: 'color',
  },
  {
    pattern: /bg-gray-300(?![a-z-])/g,
    replacement: 'bg-accent',
    type: 'color',
  },
  {
    pattern: /bg-gray-800(?![a-z-])/g,
    replacement: 'bg-secondary-foreground',
    type: 'color',
  },
  {
    pattern: /bg-gray-900(?![a-z-])/g,
    replacement: 'bg-foreground',
    type: 'color',
  },
  {
    pattern: /bg-gray-950(?![a-z-])/g,
    replacement: 'bg-foreground',
    type: 'color',
  },
  {
    pattern: /bg-black(?![a-z-])/g,
    replacement: 'bg-foreground',
    type: 'color',
  },

  {
    pattern: /text-white(?![a-z-])/g,
    replacement: 'text-background',
    type: 'color',
  },
  {
    pattern: /text-gray-300(?![a-z-])/g,
    replacement: 'text-muted-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-400(?![a-z-])/g,
    replacement: 'text-muted-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-500(?![a-z-])/g,
    replacement: 'text-muted-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-600(?![a-z-])/g,
    replacement: 'text-muted-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-700(?![a-z-])/g,
    replacement: 'text-secondary-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-800(?![a-z-])/g,
    replacement: 'text-secondary-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-900(?![a-z-])/g,
    replacement: 'text-foreground',
    type: 'color',
  },
  {
    pattern: /text-gray-950(?![a-z-])/g,
    replacement: 'text-foreground',
    type: 'color',
  },
  {
    pattern: /text-black(?![a-z-])/g,
    replacement: 'text-foreground',
    type: 'color',
  },

  {
    pattern: /border-white(?![a-z-])/g,
    replacement: 'border-background',
    type: 'color',
  },
  {
    pattern: /border-gray-100(?![a-z-])/g,
    replacement: 'border-border',
    type: 'color',
  },
  {
    pattern: /border-gray-200(?![a-z-])/g,
    replacement: 'border-border',
    type: 'color',
  },
  {
    pattern: /border-gray-300(?![a-z-])/g,
    replacement: 'border-border',
    type: 'color',
  },
  {
    pattern: /border-black(?![a-z-])/g,
    replacement: 'border-foreground',
    type: 'color',
  },

  {
    pattern: /hover:bg-gray-50(?![a-z-])/g,
    replacement: 'hover:bg-muted',
    type: 'color',
  },
  {
    pattern: /hover:bg-gray-100(?![a-z-])/g,
    replacement: 'hover:bg-secondary',
    type: 'color',
  },
  {
    pattern: /hover:bg-gray-800(?![a-z-])/g,
    replacement: 'hover:bg-secondary-foreground',
    type: 'color',
  },
  {
    pattern: /hover:text-gray-900(?![a-z-])/g,
    replacement: 'hover:text-foreground',
    type: 'color',
  },

  {
    pattern: /focus:ring-black(?![a-z-])/g,
    replacement: 'focus:ring-ring',
    type: 'color',
  },
  {
    pattern: /ring-gray-300(?![a-z-])/g,
    replacement: 'ring-ring',
    type: 'color',
  },

  // Border radius (less critical)
  {
    pattern: /rounded-lg(?![a-z-])/g,
    replacement: 'rounded-[var(--radius-lg)]',
    type: 'radius',
  },
  {
    pattern: /rounded-md(?![a-z-])/g,
    replacement: 'rounded-[var(--radius-md)]',
    type: 'radius',
  },
  {
    pattern: /rounded-xl(?![a-z-])/g,
    replacement: 'rounded-[var(--radius-xl)]',
    type: 'radius',
  },
  {
    pattern: /rounded-full(?![a-z-])/g,
    replacement: 'rounded-[var(--radius-full)]',
    type: 'radius',
  },
];

interface FileViolation {
  file: string;
  violations: Array<{
    line: number;
    column: number;
    pattern: string;
    replacement: string;
    type: string;
  }>;
  violationCount: number;
}

async function auditPhase3Files(): Promise<void> {
  console.log('🔍 Starting Phase 3 design system audit...');

  // Get all tsx/ts files, excluding node_modules, .next, dist
  const files = await glob('**/*.{ts,tsx}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      '**/*.d.ts',
      'scripts/**',
      'packages/design-system/stories/**',
      'apps/storybook/**',
    ],
    cwd: process.cwd(),
  });

  const fileViolations: FileViolation[] = [];
  const excludedFiles = [
    // Phase 1 completed files
    'apps/web/components/navigation/integrated-filters.tsx',
    'apps/web/components/navigation/components/user-actions.tsx',
    'apps/web/app/[locale]/styles.css',
    'apps/web/components/navigation/unified-bottom-nav.tsx',
    'apps/web/app/[locale]/product/[id]/components/product-detail.tsx',
    'apps/web/app/[locale]/components/product-quick-view/desktop-view.tsx',
    'apps/web/components/product-grid-client.tsx',
    'apps/web/app/[locale]/messages/components/messages-content.tsx',
    'apps/web/app/[locale]/search/components/search-results.tsx',
    'apps/web/app/[locale]/components/footer.tsx',

    // Phase 2 completed files
    'apps/app/app/[locale]/(authenticated)/dashboard/components/active-listings.tsx',
    'apps/web/components/navigation/components/category-menu.tsx',
    'apps/app/app/[locale]/(authenticated)/components/dashboard-content.tsx',
    'apps/web/app/[locale]/components/unified-search-filters.tsx',
    'apps/web/app/[locale]/components/header/mobile-search-bar.tsx',
    'apps/web/app/[locale]/components/category-nav.tsx',
    'apps/web/app/[locale]/components/algolia-search.tsx',
    'apps/web/app/[locale]/components/header/categories-dropdown.tsx',
  ];

  for (const file of files) {
    // Skip already migrated files
    if (excludedFiles.includes(file)) {
      continue;
    }

    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const fileViolationList: FileViolation['violations'] = [];

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];

        for (const violation of violations) {
          let match;
          while ((match = violation.pattern.exec(line)) !== null) {
            fileViolationList.push({
              line: lineIndex + 1,
              column: match.index + 1,
              pattern: match[0],
              replacement: violation.replacement,
              type: violation.type,
            });
          }
          // Reset regex lastIndex
          violation.pattern.lastIndex = 0;
        }
      }

      if (fileViolationList.length > 0) {
        // Only include files with <20 violations for Phase 3
        if (fileViolationList.length < 20) {
          fileViolations.push({
            file,
            violations: fileViolationList,
            violationCount: fileViolationList.length,
          });
        }
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  // Sort by violation count (highest first)
  fileViolations.sort((a, b) => b.violationCount - a.violationCount);

  console.log('\n📊 Phase 3 Audit Results:');
  console.log(`Total files with <20 violations: ${fileViolations.length}`);
  console.log(
    `Total violations found: ${fileViolations.reduce((sum, f) => sum + f.violationCount, 0)}`
  );

  // Group files by violation count
  const highPriority = fileViolations.filter((f) => f.violationCount >= 15);
  const mediumPriority = fileViolations.filter(
    (f) => f.violationCount >= 10 && f.violationCount < 15
  );
  const lowPriority = fileViolations.filter((f) => f.violationCount < 10);

  console.log('\n📈 Priority Breakdown:');
  console.log(`High Priority (15-19 violations): ${highPriority.length} files`);
  console.log(
    `Medium Priority (10-14 violations): ${mediumPriority.length} files`
  );
  console.log(`Low Priority (1-9 violations): ${lowPriority.length} files`);

  // Show top files for manual review
  console.log('\n🎯 Top Phase 3 Files (15+ violations):');
  highPriority.slice(0, 10).forEach((fileViolation, index) => {
    console.log(
      `${index + 1}. ${fileViolation.file} (${fileViolation.violationCount} violations)`
    );
  });

  // Save detailed results
  const auditResults = {
    summary: {
      totalFiles: fileViolations.length,
      totalViolations: fileViolations.reduce(
        (sum, f) => sum + f.violationCount,
        0
      ),
      highPriority: highPriority.length,
      mediumPriority: mediumPriority.length,
      lowPriority: lowPriority.length,
    },
    files: fileViolations,
  };

  writeFileSync(
    'PHASE_3_AUDIT_RESULTS.json',
    JSON.stringify(auditResults, null, 2)
  );
  console.log(
    '\n✅ Phase 3 audit complete! Results saved to PHASE_3_AUDIT_RESULTS.json'
  );
  console.log(
    `\n🚀 Ready for automated migration of ${fileViolations.length} files`
  );
}

auditPhase3Files().catch(console.error);
