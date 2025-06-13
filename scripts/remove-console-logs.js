#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to remove
const consolePatterns = [
  /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|assert|count|group|groupEnd)\([^)]*\);?\s*\n?/g,
  /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|assert|count|group|groupEnd)\([^{]*{[^}]*}\);?\s*\n?/g,
  /console\.(log|error|warn|info|debug|trace|dir|table|time|timeEnd|assert|count|group|groupEnd)\([^)]*\)[,;]?\s*\n?/g
];

// Files to process
const filePatterns = [
  'apps/**/*.{ts,tsx,js,jsx}',
  'packages/**/*.{ts,tsx,js,jsx}'
];

// Directories to exclude
const excludeDirs = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/.turbo/**',
  '**/build/**',
  '**/coverage/**',
  '**/.cache/**'
];

let totalRemoved = 0;
let filesProcessed = 0;

// Process each file pattern
filePatterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    ignore: excludeDirs
  });

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let removedCount = 0;

    // Remove console statements
    consolePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        removedCount += matches.length;
        content = content.replace(pattern, '');
      }
    });

    // Clean up extra blank lines (max 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');

    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`✓ Removed ${removedCount} console statements from ${file}`);
      totalRemoved += removedCount;
      filesProcessed++;
    }
  });
});

console.log(`\n✅ Complete! Removed ${totalRemoved} console statements from ${filesProcessed} files.`);