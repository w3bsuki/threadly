const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '.claude', 'agents');
const targetDir = path.join(__dirname, '..', '.claude', 'commands');

// Create commands directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all .md files from agents to commands
const files = fs.readdirSync(sourceDir);
files.forEach(file => {
  if (file.endsWith('.md')) {
    const source = path.join(sourceDir, file);
    const target = path.join(targetDir, file);
    fs.copyFileSync(source, target);
    console.log(`Copied: ${file}`);
  }
});

console.log('\nAll agent files have been copied to .claude/commands/');
console.log('Your slash commands should now work properly!');