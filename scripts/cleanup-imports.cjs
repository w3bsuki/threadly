const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const replacements = {
  '@repo/navigation': '@repo/design-system',
  '@repo/user-profile': '@repo/design-system',
  '@repo/typescript-config': null,
  '@repo/admin-dashboard': null,
  '@repo/storage': null,
  '@repo/ai': null,
};

const updateImports = async () => {
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', 'dist/**', '.next/**', '.turbo/**', 'scripts/cleanup-imports.js'],
  });

  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.resolve(file);
    
    // Skip if it's a directory
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    for (const [oldImport, newImport] of Object.entries(replacements)) {
      const importRegex = new RegExp(`from ['"]${oldImport}['"]`, 'g');
      const importAsRegex = new RegExp(`import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+['"]${oldImport}['"]`, 'g');
      const importDefaultRegex = new RegExp(`import\\s+\\w+\\s+from\\s+['"]${oldImport}['"]`, 'g');
      const importNamedRegex = new RegExp(`import\\s+{[^}]+}\\s+from\\s+['"]${oldImport}['"]`, 'g');

      if (content.match(importRegex)) {
        if (newImport) {
          content = content.replace(importRegex, `from '${newImport}'`);
          hasChanges = true;
        } else {
          console.warn(`WARNING: Found import from deleted package ${oldImport} in ${file}`);
        }
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
      console.log(`Updated imports in: ${file}`);
    }
  }

  console.log(`\nCompleted! Updated ${updatedCount} files.`);
};

updateImports().catch(console.error);