#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function removeConsoleLogs() {
  const files = await glob('apps/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*']
  });

  let totalRemoved = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    let modified = false;
    const newLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line contains console.log or console.error
      if (line.includes('console.log') || line.includes('console.error')) {
        // Skip the line entirely if it's just a console statement
        if (line.trim().startsWith('console.')) {
          modified = true;
          totalRemoved++;
          continue;
        }
        
        // Remove inline console statements
        const cleanedLine = line
          .replace(/console\.(log|error)\([^;]*\);?/g, '')
          .replace(/console\.(log|error)\s*\([^)]*\)[,;]?\s*/g, '');
        
        if (cleanedLine.trim()) {
          newLines.push(cleanedLine);
          modified = true;
          totalRemoved++;
        } else {
          // Skip empty lines after removal
          modified = true;
          totalRemoved++;
          continue;
        }
      } else {
        newLines.push(line);
      }
    }

    if (modified) {
      writeFileSync(file, newLines.join('\n'));
      console.log(`✓ Cleaned ${file}`);
    }
  }

  console.log(`\nRemoved ${totalRemoved} console statements`);
}

removeConsoleLogs().catch(console.error);