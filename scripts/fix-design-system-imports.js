#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get all files with deep design-system imports
const files = execSync('find apps -name "*.tsx" -o -name "*.ts" | xargs grep -l "@repo/design-system/components/ui/" || true', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} files with deep design-system imports`);

// Map of deep imports to main export imports
const importMap = {
  '@repo/design-system/components/ui/accordion': '@repo/design-system/components',
  '@repo/design-system/components/ui/alert': '@repo/design-system/components',
  '@repo/design-system/components/ui/alert-dialog': '@repo/design-system/components',
  '@repo/design-system/components/ui/aspect-ratio': '@repo/design-system/components',
  '@repo/design-system/components/ui/avatar': '@repo/design-system/components',
  '@repo/design-system/components/ui/badge': '@repo/design-system/components',
  '@repo/design-system/components/ui/breadcrumb': '@repo/design-system/components',
  '@repo/design-system/components/ui/button': '@repo/design-system/components',
  '@repo/design-system/components/ui/calendar': '@repo/design-system/components',
  '@repo/design-system/components/ui/card': '@repo/design-system/components',
  '@repo/design-system/components/ui/carousel': '@repo/design-system/components',
  '@repo/design-system/components/ui/checkbox': '@repo/design-system/components',
  '@repo/design-system/components/ui/collapsible': '@repo/design-system/components',
  '@repo/design-system/components/ui/command': '@repo/design-system/components',
  '@repo/design-system/components/ui/context-menu': '@repo/design-system/components',
  '@repo/design-system/components/ui/dialog': '@repo/design-system/components',
  '@repo/design-system/components/ui/drawer': '@repo/design-system/components',
  '@repo/design-system/components/ui/dropdown-menu': '@repo/design-system/components',
  '@repo/design-system/components/ui/form': '@repo/design-system/components',
  '@repo/design-system/components/ui/hover-card': '@repo/design-system/components',
  '@repo/design-system/components/ui/input': '@repo/design-system/components',
  '@repo/design-system/components/ui/input-otp': '@repo/design-system/components',
  '@repo/design-system/components/ui/label': '@repo/design-system/components',
  '@repo/design-system/components/ui/lazy-image': '@repo/design-system/components',
  '@repo/design-system/components/ui/menubar': '@repo/design-system/components',
  '@repo/design-system/components/ui/navigation-menu': '@repo/design-system/components',
  '@repo/design-system/components/ui/pagination': '@repo/design-system/components',
  '@repo/design-system/components/ui/popover': '@repo/design-system/components',
  '@repo/design-system/components/ui/progress': '@repo/design-system/components',
  '@repo/design-system/components/ui/pull-to-refresh': '@repo/design-system/components',
  '@repo/design-system/components/ui/radio-group': '@repo/design-system/components',
  '@repo/design-system/components/ui/resizable': '@repo/design-system/components',
  '@repo/design-system/components/ui/scroll-area': '@repo/design-system/components',
  '@repo/design-system/components/ui/select': '@repo/design-system/components',
  '@repo/design-system/components/ui/separator': '@repo/design-system/components',
  '@repo/design-system/components/ui/sheet': '@repo/design-system/components',
  '@repo/design-system/components/ui/sidebar': '@repo/design-system/components',
  '@repo/design-system/components/ui/skeleton': '@repo/design-system/components',
  '@repo/design-system/components/ui/slider': '@repo/design-system/components',
  '@repo/design-system/components/ui/switch': '@repo/design-system/components',
  '@repo/design-system/components/ui/table': '@repo/design-system/components',
  '@repo/design-system/components/ui/tabs': '@repo/design-system/components',
  '@repo/design-system/components/ui/textarea': '@repo/design-system/components',
  '@repo/design-system/components/ui/toggle': '@repo/design-system/components',
  '@repo/design-system/components/ui/toggle-group': '@repo/design-system/components',
  '@repo/design-system/components/ui/tooltip': '@repo/design-system/components',
  '@repo/design-system/components/ui/sonner': '@repo/design-system/components',
  '@repo/design-system/components/ui/service-worker-registration': '@repo/design-system/components',
  '@repo/design-system/components/ui/micro-interactions': '@repo/design-system/components',
  '@repo/design-system/components/ui/animated': '@repo/design-system/components',
};

let totalUpdated = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;

  // Replace each deep import with main export
  Object.entries(importMap).forEach(([deepImport, mainImport]) => {
    const regex = new RegExp(`from\\s+['"]${deepImport}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `from '${mainImport}'`);
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
console.log('\nNow checking for any remaining deep imports...');

// Check for any remaining deep imports
const remaining = execSync('find apps -name "*.tsx" -o -name "*.ts" | xargs grep "@repo/design-system/components/ui/" || true', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

if (remaining.length > 0) {
  console.log(`\nWarning: Found ${remaining.length} remaining deep imports that may need manual review:`);
  remaining.slice(0, 10).forEach(line => console.log(line));
  if (remaining.length > 10) {
    console.log(`... and ${remaining.length - 10} more`);
  }
} else {
  console.log('\n✅ All deep imports have been updated!');
}