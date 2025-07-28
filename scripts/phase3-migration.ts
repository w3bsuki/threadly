import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

// Read the Phase 3 audit results
const auditData = JSON.parse(
  readFileSync('PHASE_3_AUDIT_RESULTS.json', 'utf-8')
);

// Define the design system migrations
const migrations = [
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

interface MigrationResult {
  file: string;
  originalViolations: number;
  changesApplied: number;
  success: boolean;
  error?: string;
}

async function migratePhase3Files(): Promise<void> {
  console.log('🚀 Starting Phase 3 automated migration...');
  console.log(`📁 Processing ${auditData.files.length} files`);

  const results: MigrationResult[] = [];
  let totalChanges = 0;

  for (let i = 0; i < auditData.files.length; i++) {
    const fileData = auditData.files[i];
    const { file, violationCount } = fileData;

    // Show progress
    if (i % 20 === 0) {
      console.log(
        `📈 Progress: ${i}/${auditData.files.length} files processed`
      );
    }

    try {
      let content = readFileSync(file, 'utf-8');
      let changesApplied = 0;

      // Apply all migrations
      for (const migration of migrations) {
        const matches = content.match(migration.pattern);
        if (matches) {
          content = content.replace(migration.pattern, migration.replacement);
          changesApplied += matches.length;
        }
        // Reset regex lastIndex
        migration.pattern.lastIndex = 0;
      }

      if (changesApplied > 0) {
        writeFileSync(file, content, 'utf-8');
        totalChanges += changesApplied;
      }

      results.push({
        file,
        originalViolations: violationCount,
        changesApplied,
        success: true,
      });
    } catch (error) {
      console.error(`❌ Error migrating ${file}:`, error);
      results.push({
        file,
        originalViolations: violationCount,
        changesApplied: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Generate summary
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const filesWithChanges = successful.filter((r) => r.changesApplied > 0);

  console.log('\n✅ Phase 3 Migration Complete!');
  console.log('📊 Summary:');
  console.log(`  - Files processed: ${results.length}`);
  console.log(`  - Files migrated: ${filesWithChanges.length}`);
  console.log(`  - Total changes: ${totalChanges}`);
  console.log(
    `  - Success rate: ${Math.round((successful.length / results.length) * 100)}%`
  );

  if (failed.length > 0) {
    console.log(`  - Failed files: ${failed.length}`);
  }

  // Show top migrated files
  console.log('\n🎯 Top migrated files:');
  filesWithChanges
    .sort((a, b) => b.changesApplied - a.changesApplied)
    .slice(0, 10)
    .forEach((result, index) => {
      console.log(
        `${index + 1}. ${result.file} (${result.changesApplied} changes)`
      );
    });

  // Category breakdown
  const categories = {
    'design-system': filesWithChanges.filter((r) =>
      r.file.includes('packages/design-system')
    ),
    'web-app': filesWithChanges.filter((r) => r.file.includes('apps/web')),
    'mobile-app': filesWithChanges.filter((r) => r.file.includes('apps/app')),
    packages: filesWithChanges.filter(
      (r) =>
        r.file.includes('packages/') &&
        !r.file.includes('packages/design-system')
    ),
  };

  console.log('\n📦 Migration by category:');
  Object.entries(categories).forEach(([category, files]) => {
    const changes = files.reduce((sum, f) => sum + f.changesApplied, 0);
    console.log(`  - ${category}: ${files.length} files, ${changes} changes`);
  });

  // Save detailed results
  const migrationSummary = {
    timestamp: new Date().toISOString(),
    phase: 3,
    summary: {
      totalFiles: results.length,
      migratedFiles: filesWithChanges.length,
      totalChanges,
      successRate: Math.round((successful.length / results.length) * 100),
    },
    results: results.sort((a, b) => b.changesApplied - a.changesApplied),
    categories,
  };

  writeFileSync(
    'PHASE_3_MIGRATION_RESULTS.json',
    JSON.stringify(migrationSummary, null, 2)
  );
  console.log('\n💾 Detailed results saved to PHASE_3_MIGRATION_RESULTS.json');
}

migratePhase3Files().catch(console.error);
