#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// Get all files with deep observability imports
const files = execSync('find apps -name "*.tsx" -o -name "*.ts" | xargs grep -l "@repo/observability/" | grep -v "@repo/observability\\"" || true', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files with deep observability imports`);

let totalUpdated = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;

  // Replace deep imports with server import (since log and logError are server utilities)
  const patterns = [
    { from: /@repo\/observability\/log/g, to: '@repo/observability/server' },
    { from: /@repo\/observability\/error/g, to: '@repo/observability/server' }
  ];

  patterns.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    totalUpdated++;
    console.log(`✓ Updated: ${filePath}`);
  }
});

console.log(`\nUpdated ${totalUpdated} files`);