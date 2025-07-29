#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// ANSI color codes for colorized output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Old to new import mappings based on Phase 2 consolidation
const importMappings = {
  // api-utils → utils/src/api
  '@repo/api-utils': '@repo/utils/api',
  'from "@repo/api-utils"': 'from "@repo/utils/api"',
  "from '@repo/api-utils'": "from '@repo/utils/api'",
  
  // cache → database/src/cache
  '@repo/cache': '@repo/database/cache',
  'from "@repo/cache"': 'from "@repo/database/cache"',
  "from '@repo/cache'": "from '@repo/database/cache'",
  
  // real-time → notifications/src/realtime
  '@repo/real-time': '@repo/notifications/realtime',
  'from "@repo/real-time"': 'from "@repo/notifications/realtime"',
  "from '@repo/real-time'": "from '@repo/notifications/realtime'",
  
  // Removed packages that should be replaced
  '@repo/logger': '@repo/observability/log',
  'from "@repo/logger"': 'from "@repo/observability/log"',
  "from '@repo/logger'": "from '@repo/observability/log'",
  
  '@repo/monitoring': '@repo/observability',
  'from "@repo/monitoring"': 'from "@repo/observability"',
  "from '@repo/monitoring'": "from '@repo/observability'",
  
  '@repo/rate-limiter': '@repo/security/rate-limits',
  'from "@repo/rate-limiter"': 'from "@repo/security/rate-limits"',
  "from '@repo/rate-limiter'": "from '@repo/security/rate-limits'",
};

// Path-based mappings for relative imports
const pathMappings = {
  // api-utils paths
  '../packages/api-utils': '@repo/utils/api',
  '../../packages/api-utils': '@repo/utils/api',
  '../../../packages/api-utils': '@repo/utils/api',
  '../../../../packages/api-utils': '@repo/utils/api',
  
  // cache paths
  '../packages/cache': '@repo/database/cache',
  '../../packages/cache': '@repo/database/cache',
  '../../../packages/cache': '@repo/database/cache',
  '../../../../packages/cache': '@repo/database/cache',
  
  // real-time paths
  '../packages/real-time': '@repo/notifications/realtime',
  '../../packages/real-time': '@repo/notifications/realtime',
  '../../../packages/real-time': '@repo/notifications/realtime',
  '../../../../packages/real-time': '@repo/notifications/realtime',
  
  // Removed package paths
  '../packages/logger': '@repo/observability/log',
  '../../packages/logger': '@repo/observability/log',
  '../../../packages/logger': '@repo/observability/log',
  '../../../../packages/logger': '@repo/observability/log',
  
  '../packages/monitoring': '@repo/observability',
  '../../packages/monitoring': '@repo/observability',
  '../../../packages/monitoring': '@repo/observability',
  '../../../../packages/monitoring': '@repo/observability',
  
  '../packages/rate-limiter': '@repo/security/rate-limits',
  '../../packages/rate-limiter': '@repo/security/rate-limits',
  '../../../packages/rate-limiter': '@repo/security/rate-limits',
  '../../../../packages/rate-limiter': '@repo/security/rate-limits',
};

// Statistics tracking
let stats = {
  filesScanned: 0,
  filesWithIssues: 0,
  issuesFound: 0,
  issuesFixed: 0,
  errors: [],
  deprecatedPackages: {
    '@repo/api-utils': 0,
    '@repo/cache': 0,
    '@repo/real-time': 0,
    '@repo/logger': 0,
    '@repo/monitoring': 0,
    '@repo/rate-limiter': 0
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const verbose = args.includes('--verbose');
const showHelp = args.includes('--help') || args.includes('-h');
const targetPath = args.find(arg => !arg.startsWith('--')) || process.cwd();

// Show help if requested
if (showHelp) {
  console.log(`
${colors.bright}Import Verification Tool${colors.reset}
Phase 2 Consolidation Checker for Threadly Monorepo

${colors.cyan}Usage:${colors.reset}
  pnpm verify-imports [path] [options]

${colors.cyan}Options:${colors.reset}
  --fix       Automatically fix import issues
  --verbose   Show all issues (not just first 10)
  --help, -h  Show this help message

${colors.cyan}Examples:${colors.reset}
  pnpm verify-imports                  # Check entire codebase
  pnpm verify-imports apps/web         # Check specific directory
  pnpm verify-imports --fix            # Fix all issues
  pnpm verify-imports apps/app --fix   # Fix issues in specific directory

${colors.cyan}Package Migrations:${colors.reset}
  @repo/api-utils    → @repo/utils/api
  @repo/cache        → @repo/database/cache
  @repo/real-time    → @repo/notifications/realtime
  @repo/logger       → @repo/observability/log
  @repo/monitoring   → @repo/observability
  @repo/rate-limiter → @repo/security/rate-limits
`);
  process.exit(0);
}

// Progress indicator
let progressInterval;
let progressDots = 0;

function startProgress(message) {
  process.stdout.write(`${colors.cyan}${message}${colors.reset}`);
  progressInterval = setInterval(() => {
    process.stdout.write('.');
    progressDots++;
    if (progressDots > 3) {
      process.stdout.write('\b\b\b\b    \b\b\b\b');
      progressDots = 0;
    }
  }, 500);
}

function stopProgress() {
  if (progressInterval) {
    clearInterval(progressInterval);
    process.stdout.write('\n');
  }
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(file, line, issue, suggestion) {
  stats.issuesFound++;
  stats.errors.push({ file, line, issue, suggestion });
  
  // Track deprecated package usage
  for (const pkg of Object.keys(stats.deprecatedPackages)) {
    if (issue.includes(pkg)) {
      stats.deprecatedPackages[pkg]++;
      break;
    }
  }
  
  if (!verbose && stats.errors.length > 10) return;
  
  console.log(`\n${colors.red}✗ Issue found:${colors.reset}`);
  console.log(`  ${colors.dim}File:${colors.reset} ${file}`);
  console.log(`  ${colors.dim}Line:${colors.reset} ${line}`);
  console.log(`  ${colors.dim}Issue:${colors.reset} ${colors.yellow}${issue}${colors.reset}`);
  console.log(`  ${colors.dim}Fix:${colors.reset} ${colors.green}${suggestion}${colors.reset}`);
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let hasIssues = false;
    let modifiedContent = content;
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for import statements
      if (line.includes('import') || line.includes('require')) {
        // Check direct @repo imports
        for (const [oldImport, newImport] of Object.entries(importMappings)) {
          if (line.includes(oldImport)) {
            hasIssues = true;
            const fixedLine = line.replace(new RegExp(escapeRegExp(oldImport), 'g'), newImport);
            logError(filePath, lineNumber, oldImport, newImport);
            
            if (shouldFix) {
              modifiedContent = modifiedContent.replace(line, fixedLine);
              stats.issuesFixed++;
            }
          }
        }
        
        // Check relative path imports
        for (const [oldPath, newImport] of Object.entries(pathMappings)) {
          if (line.includes(oldPath)) {
            hasIssues = true;
            const fixedLine = line.replace(new RegExp(escapeRegExp(oldPath), 'g'), newImport);
            logError(filePath, lineNumber, oldPath, newImport);
            
            if (shouldFix) {
              modifiedContent = modifiedContent.replace(line, fixedLine);
              stats.issuesFixed++;
            }
          }
        }
      }
    });
    
    if (hasIssues) {
      stats.filesWithIssues++;
      
      if (shouldFix && modifiedContent !== content) {
        fs.writeFileSync(filePath, modifiedContent);
        log(`  ${colors.green}✓ Fixed${colors.reset} ${filePath}`, 'green');
      }
    }
    
    stats.filesScanned++;
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'red');
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findFiles(targetDir) {
  const patterns = [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.mjs',
    '**/*.cjs'
  ];
  
  const ignorePatterns = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/build/**',
    '**/.turbo/**',
    '**/coverage/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**'
  ];
  
  let allFiles = [];
  
  patterns.forEach(pattern => {
    // Use POSIX paths for glob on Windows
    const globPattern = path.posix.join(targetDir.replace(/\\/g, '/'), pattern);
    const files = glob.sync(globPattern, {
      ignore: ignorePatterns,
      absolute: true,
      windowsPathsNoEscape: true
    });
    allFiles = allFiles.concat(files);
  });
  
  return [...new Set(allFiles)]; // Remove duplicates
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  log('Import Verification Report', 'bright');
  console.log('='.repeat(60));
  
  log(`\nFiles scanned: ${stats.filesScanned}`, 'cyan');
  log(`Files with issues: ${stats.filesWithIssues}`, stats.filesWithIssues > 0 ? 'yellow' : 'green');
  log(`Total issues found: ${stats.issuesFound}`, stats.issuesFound > 0 ? 'yellow' : 'green');
  
  if (shouldFix) {
    log(`Issues fixed: ${stats.issuesFixed}`, 'green');
    log(`Issues remaining: ${stats.issuesFound - stats.issuesFixed}`, 
        stats.issuesFound - stats.issuesFixed > 0 ? 'red' : 'green');
  }
  
  // Show deprecated package usage
  if (stats.issuesFound > 0) {
    console.log(`\n${colors.bright}Deprecated Package Usage:${colors.reset}`);
    Object.entries(stats.deprecatedPackages).forEach(([pkg, count]) => {
      if (count > 0) {
        const newPkg = importMappings[pkg] || 'Unknown';
        console.log(`  ${colors.red}${pkg}${colors.reset} → ${colors.green}${newPkg}${colors.reset} (${count} occurrences)`);
      }
    });
  }
  
  if (stats.errors.length > 0 && !verbose) {
    console.log(`\n${colors.dim}Showing first 10 issues. Use --verbose to see all.${colors.reset}`);
  }
  
  if (stats.issuesFound > 0 && !shouldFix) {
    console.log(`\n${colors.yellow}To automatically fix these issues, run:${colors.reset}`);
    console.log(`${colors.bright}pnpm verify-imports --fix${colors.reset}`);
  }
  
  console.log('\n' + '='.repeat(60));
}

function main() {
  console.clear();
  log('🔍 Import Verification Tool', 'bright');
  log('Phase 2 Consolidation Checker\n', 'dim');
  
  const absoluteTargetPath = path.resolve(targetPath);
  
  if (!fs.existsSync(absoluteTargetPath)) {
    log(`Error: Path "${absoluteTargetPath}" does not exist`, 'red');
    process.exit(1);
  }
  
  log(`Target: ${absoluteTargetPath}`, 'cyan');
  log(`Mode: ${shouldFix ? 'Fix imports' : 'Check only'}`, 'cyan');
  log(`Verbose: ${verbose ? 'Yes' : 'No'}\n`, 'cyan');
  
  startProgress('Scanning files');
  
  const files = findFiles(absoluteTargetPath);
  
  stopProgress();
  log(`Found ${files.length} files to scan\n`, 'dim');
  
  if (files.length === 0) {
    log('No files found to scan', 'yellow');
    process.exit(0);
  }
  
  startProgress('Analyzing imports');
  
  files.forEach(file => {
    scanFile(file);
  });
  
  stopProgress();
  
  generateReport();
  
  // Exit with error code if issues were found and not fixed
  if (stats.issuesFound > 0 && !shouldFix) {
    process.exit(1);
  }
}

// Run the script
main();