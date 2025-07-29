# Import Verification Tool

## Overview

The `verify-imports` script is an automated tool designed to check and fix import statements after the Phase 2 consolidation of the Threadly monorepo. It ensures all imports are updated to reflect the new package structure.

## Phase 2 Consolidation Changes

The following packages were consolidated:

- **api-utils/** → **utils/src/api/**
- **cache/** → **database/src/cache/**
- **real-time/** → **notifications/src/realtime/**

The following packages were removed and their functionality moved:

- **logger/** → Use **@repo/observability/log**
- **monitoring/** → Use **@repo/observability**
- **rate-limiter/** → Use **@repo/security/rate-limits**

## Installation

The script is already included in the monorepo and can be run using pnpm:

```bash
pnpm verify-imports
```

## Usage

### Basic Usage

Check the entire codebase for outdated imports:

```bash
pnpm verify-imports
```

Check a specific directory:

```bash
pnpm verify-imports apps/web
```

### Options

- `--fix` - Automatically fix all found import issues
- `--verbose` - Show all issues (by default, only the first 10 are shown)
- `--help, -h` - Show help message

### Examples

```bash
# Check entire codebase
pnpm verify-imports

# Check and fix imports in apps/web
pnpm verify-imports apps/web --fix

# Check all imports with verbose output
pnpm verify-imports --verbose

# Fix all imports in the entire codebase
pnpm verify-imports --fix
```

## Features

### 1. Comprehensive Import Detection

The script checks for:
- Direct `@repo` package imports
- Relative path imports to packages directory
- Import statements using both `import` and `require` syntax

### 2. Colorized Output

- 🔴 Red: Issues found
- 🟢 Green: Suggested fixes and successful operations
- 🟡 Yellow: Warnings and files with issues
- 🔵 Blue: Informational messages
- ⚫ Gray: File paths and line numbers

### 3. Progress Indicators

Shows a live progress indicator while scanning files to provide feedback during long operations.

### 4. Detailed Report

After scanning, the tool provides:
- Total files scanned
- Number of files with issues
- Total issues found
- Deprecated package usage breakdown
- Clear instructions for fixing issues

### 5. Safe Operation

- In check mode (default), no files are modified
- Shows exactly what would be changed before making any modifications
- Preserves file formatting and only changes import statements

### 6. Windows Compatibility

The script is designed to work correctly on Windows systems with proper path handling.

## What Gets Checked

The script scans the following file types:
- `.ts` - TypeScript files
- `.tsx` - TypeScript React files
- `.js` - JavaScript files
- `.jsx` - JavaScript React files
- `.mjs` - ES modules
- `.cjs` - CommonJS modules

The following directories are ignored:
- `node_modules/`
- `dist/`
- `.next/`
- `build/`
- `.turbo/`
- `coverage/`
- Test files (`*.test.*`, `*.spec.*`, `__tests__/`)

## Exit Codes

- `0` - No issues found or all issues fixed successfully
- `1` - Issues found and not fixed (when run without `--fix`)

## CI/CD Integration

The script can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Check imports
  run: pnpm verify-imports
```

This will fail the build if any outdated imports are found.

## Troubleshooting

### Script not finding files

If the script reports "No files found to scan", ensure:
1. You're running it from the monorepo root
2. The target directory exists and contains source files
3. The path is correct (use forward slashes even on Windows)

### Permission errors

If you encounter permission errors when using `--fix`:
1. Ensure no files are open in editors
2. Check file permissions
3. Try running with elevated privileges if necessary

## Contributing

To modify the script:
1. Edit `scripts/verify-imports.cjs`
2. Test changes thoroughly with both check and fix modes
3. Update this README if adding new features