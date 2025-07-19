#!/usr/bin/env node

import { readFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Design System Audit Script
 * 
 * This script audits the codebase for design system compliance and generates
 * a report of areas that need migration.
 * 
 * Usage:
 *   pnpm tsx scripts/design-system-audit.ts [options]
 * 
 * Options:
 *   --json       Output results as JSON
 *   --app        Audit specific app (web, app, api, storybook)
 *   --category   Focus on specific category (colors, spacing, typography, etc.)
 */

interface AuditRule {
  name: string;
  category: 'colors' | 'spacing' | 'typography' | 'imports' | 'patterns';
  pattern: RegExp;
  severity: 'error' | 'warning' | 'info';
  message: string;
  autoFixable: boolean;
}

interface AuditResult {
  file: string;
  violations: Array<{
    rule: AuditRule;
    line: number;
    column: number;
    code: string;
  }>;
}

const auditRules: AuditRule[] = [
  // Color violations
  {
    name: 'hardcoded-hex',
    category: 'colors',
    pattern: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g,
    severity: 'error',
    message: 'Hardcoded hex color found. Use design system color tokens.',
    autoFixable: false,
  },
  {
    name: 'rgb-rgba',
    category: 'colors',
    pattern: /rgba?\s*\([^)]+\)/g,
    severity: 'error',
    message: 'RGB/RGBA color found. Use design system color tokens.',
    autoFixable: false,
  },
  {
    name: 'tailwind-colors',
    category: 'colors',
    pattern: /\b(bg|text|border|ring)-(black|white|gray|red|blue|green|yellow|purple|pink|indigo)-\d{2,3}\b/g,
    severity: 'warning',
    message: 'Tailwind color utility found. Use semantic color tokens.',
    autoFixable: true,
  },
  {
    name: 'non-semantic-colors',
    category: 'colors',
    pattern: /\b(bg|text)-(black|white)\b/g,
    severity: 'warning',
    message: 'Non-semantic color class. Use bg-primary, text-foreground, etc.',
    autoFixable: true,
  },

  // Spacing violations
  {
    name: 'arbitrary-spacing',
    category: 'spacing',
    pattern: /\b(p|m|gap|space)-\[([\d.]+)(px|rem|em)\]/g,
    severity: 'warning',
    message: 'Arbitrary spacing value. Use design system spacing scale.',
    autoFixable: false,
  },
  {
    name: 'inline-spacing-px',
    category: 'spacing',
    pattern: /style=\{[^}]*(?:padding|margin|gap)\s*:\s*["']?\d+px/g,
    severity: 'error',
    message: 'Inline pixel spacing. Use var(--space-*) tokens.',
    autoFixable: true,
  },

  // Typography violations
  {
    name: 'custom-font-size',
    category: 'typography',
    pattern: /\btext-\[([\d.]+)(px|rem|em)\]/g,
    severity: 'warning',
    message: 'Arbitrary font size. Use design system typography scale.',
    autoFixable: false,
  },
  {
    name: 'inline-font-family',
    category: 'typography',
    pattern: /fontFamily\s*:\s*["'][^"']+["']/g,
    severity: 'error',
    message: 'Custom font family. Use var(--font-sans) or var(--font-mono).',
    autoFixable: false,
  },

  // Import violations
  {
    name: 'direct-shadcn-import',
    category: 'imports',
    pattern: /from\s+["'](@\/components\/ui|shadcn\/ui)/g,
    severity: 'error',
    message: 'Direct shadcn/ui import. Use @repo/design-system imports.',
    autoFixable: true,
  },
  {
    name: 'missing-design-system-import',
    category: 'imports',
    pattern: /^(?!.*@repo\/design-system).*\b(Button|Card|Input|Select|Dialog)\b/gm,
    severity: 'info',
    message: 'Component used without design system import.',
    autoFixable: false,
  },

  // Pattern violations
  {
    name: 'custom-button-styles',
    category: 'patterns',
    pattern: /<button[^>]+className="[^"]*(?:px-|py-|bg-|hover:bg-)[^"]*"/g,
    severity: 'warning',
    message: 'Custom button styling. Use Button component with variants.',
    autoFixable: false,
  },
  {
    name: 'custom-focus-styles',
    category: 'patterns',
    pattern: /focus:(outline|ring|border)-/g,
    severity: 'info',
    message: 'Custom focus styles. Ensure they match design system patterns.',
    autoFixable: false,
  },
];

function auditFile(filePath: string): AuditResult {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: AuditResult['violations'] = [];

  auditRules.forEach((rule) => {
    const matches = Array.from(content.matchAll(rule.pattern));
    
    matches.forEach((match) => {
      if (match.index === undefined) return;
      
      // Calculate line and column
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const lastNewlineIndex = beforeMatch.lastIndexOf('\n');
      const column = match.index - lastNewlineIndex;
      
      // Get the line of code
      const code = lines[lineNumber - 1] || '';
      
      violations.push({
        rule,
        line: lineNumber,
        column,
        code: code.trim(),
      });
    });
  });

  return { file: filePath, violations };
}

function auditApp(appName?: string): AuditResult[] {
  const basePath = appName ? `apps/${appName}` : 'apps';
  const files = glob.sync(`${basePath}/**/*.{tsx,jsx,ts,js,css}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
  });

  return files.map(auditFile).filter(result => result.violations.length > 0);
}

function generateReport(results: AuditResult[], outputJson = false) {
  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const stats = {
    totalFiles: results.length,
    totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
    byCategory: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>,
    autoFixable: 0,
  };

  // Calculate statistics
  results.forEach((result) => {
    result.violations.forEach((violation) => {
      stats.byCategory[violation.rule.category] = 
        (stats.byCategory[violation.rule.category] || 0) + 1;
      stats.bySeverity[violation.rule.severity] = 
        (stats.bySeverity[violation.rule.severity] || 0) + 1;
      if (violation.rule.autoFixable) stats.autoFixable++;
    });
  });

  // Print header
  console.log('\n🔍 Design System Audit Report\n');
  console.log('=' .repeat(80));

  // Print summary
  console.log('\n📊 Summary\n');
  console.log(`  Total files with violations: ${stats.totalFiles}`);
  console.log(`  Total violations: ${stats.totalViolations}`);
  console.log(`  Auto-fixable: ${stats.autoFixable} (${Math.round(stats.autoFixable / stats.totalViolations * 100)}%)`);

  // Print by severity
  console.log('\n🚦 By Severity\n');
  Object.entries(stats.bySeverity).forEach(([severity, count]) => {
    const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
    console.log(`  ${icon} ${severity}: ${count}`);
  });

  // Print by category
  console.log('\n📂 By Category\n');
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

  // Print top violating files
  const topFiles = results
    .sort((a, b) => b.violations.length - a.violations.length)
    .slice(0, 10);

  console.log('\n📋 Top Files with Violations\n');
  topFiles.forEach((result) => {
    const errorCount = result.violations.filter(v => v.rule.severity === 'error').length;
    const warningCount = result.violations.filter(v => v.rule.severity === 'warning').length;
    
    console.log(`  ${result.file}`);
    console.log(`    ${errorCount} errors, ${warningCount} warnings\n`);
  });

  // Print sample violations
  console.log('\n🔍 Sample Violations\n');
  
  const samplesByCategory = new Map<string, typeof results[0]['violations']>();
  results.forEach((result) => {
    result.violations.forEach((violation) => {
      if (!samplesByCategory.has(violation.rule.category)) {
        samplesByCategory.set(violation.rule.category, []);
      }
      const samples = samplesByCategory.get(violation.rule.category)!;
      if (samples.length < 3) {
        samples.push(violation);
      }
    });
  });

  samplesByCategory.forEach((violations, category) => {
    console.log(`  ${category}:`);
    violations.forEach((violation) => {
      const severity = violation.rule.severity;
      
      console.log(`    ${severity}: ${violation.rule.message}`);
      console.log(`    ${violation.code}`);
      if (violation.rule.autoFixable) {
        console.log(`    ✓ Auto-fixable`);
      }
      console.log('');
    });
  });

  // Print recommendations
  console.log('\n💡 Recommendations\n');
  console.log('  1. Run "pnpm tsx scripts/migrate-to-design-system.ts --dry-run" to preview auto-fixes');
  console.log('  2. Address error severity issues first');
  console.log('  3. Review the migration plan in DESIGN_SYSTEM_MIGRATION_PLAN.md');
  console.log('  4. Use "pnpm tsx scripts/design-system-audit.ts --json" for CI integration');
  console.log('');
}

// CLI
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const appName = args.find((arg, i) => args[i - 1] === '--app');
const category = args.find((arg, i) => args[i - 1] === '--category');

// Filter rules by category if specified
if (category) {
  const filteredRules = auditRules.filter(rule => rule.category === category);
  if (filteredRules.length === 0) {
    console.error(`Invalid category: ${category}`);
    console.error(`Valid categories: ${[...new Set(auditRules.map(r => r.category))].join(', ')}`);
    process.exit(1);
  }
  auditRules.length = 0;
  auditRules.push(...filteredRules);
}

console.log('🚀 Running Design System Audit...\n');

try {
  const results = auditApp(appName);
  generateReport(results, outputJson);
  
  // Exit with error code if violations found
  if (results.length > 0) {
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Audit failed:', error);
  process.exit(1);
}