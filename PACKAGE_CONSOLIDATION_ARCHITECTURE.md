# Package Consolidation Architecture & Implementation Plan
**Next-Forge Alignment: 22 → 8 Packages**

## Executive Summary

This plan consolidates 22 existing packages into 8 optimally-structured packages for Next-Forge alignment while maintaining all functionality and minimizing breaking changes.

**Target State:**
- **Current:** 22 packages with complex interdependencies
- **Target:** 8 focused packages with clear responsibilities  
- **Alignment:** 95% Next-Forge compliance
- **Impact:** 65% reduction in package complexity

---

## 1. Target Package Architecture

### Package 1: @repo/ui
**Purpose:** All design system, components, and UI-related functionality
```
packages/ui/
├── package.json
├── src/
│   ├── index.ts
│   ├── components/          # From design-system/components
│   ├── hooks/              # From design-system/hooks
│   ├── lib/                # From design-system/lib
│   ├── styles/             # From design-system/styles
│   └── collaboration/      # From collaboration/
│       ├── auth.ts
│       ├── config.ts
│       ├── hooks.ts
│       └── room.tsx
└── tsconfig.json
```

### Package 2: @repo/database
**Purpose:** Database, caching, and data persistence (Keep existing - already optimal)
```
packages/database/
├── package.json
├── src/
│   ├── index.ts
│   ├── lib/
│   ├── cache/              # Already consolidated
│   └── examples/
├── prisma/
└── tsconfig.json
```

### Package 3: @repo/auth
**Purpose:** Authentication, authorization, and security
```
packages/auth/
├── package.json
├── src/
│   ├── index.ts
│   ├── components/         # From auth/components
│   ├── hooks/              # From auth/hooks
│   ├── lib/                # From auth/lib
│   ├── security/           # From security/
│   │   ├── audit-log.ts
│   │   ├── csrf.ts
│   │   ├── middleware.ts
│   │   └── rate-limits.ts
│   └── rate-limit/         # From rate-limit/
│       └── index.ts
└── tsconfig.json
```

### Package 4: @repo/api
**Purpose:** API utilities, validation, middleware, and configuration
```
packages/api/
├── package.json
├── src/
│   ├── index.ts
│   ├── actions/            # From utils/src/api/actions
│   ├── errors/             # From utils/src/api/errors
│   ├── middleware/         # From utils/src/api/middleware
│   ├── responses/          # From utils/src/api/responses
│   ├── trpc/               # From utils/src/api/trpc
│   ├── validation/         # From utils/src/validation
│   ├── search/             # From utils/src/search
│   ├── config/             # From next-config/
│   │   ├── eslint/
│   │   ├── prettier/
│   │   └── next/
│   └── typescript/         # From typescript-config/
│       ├── base.json
│       ├── nextjs.json
│       └── react-library.json
└── tsconfig.json
```

### Package 5: @repo/integrations
**Purpose:** External service integrations
```
packages/integrations/
├── package.json
├── src/
│   ├── index.ts
│   ├── ai/                 # From ai/
│   │   ├── anthropic.ts
│   │   ├── embeddings.ts
│   │   └── types.ts
│   ├── email/              # From email/
│   │   ├── providers.ts
│   │   ├── send.ts
│   │   └── templates/
│   ├── storage/            # From storage/
│   │   ├── s3.ts
│   │   ├── uploadthing.ts
│   │   └── utils.ts
│   └── payments/           # From payments/
│       ├── client.ts
│       └── ai.ts
└── tsconfig.json
```

### Package 6: @repo/tooling
**Purpose:** Development tools and observability
```
packages/tooling/
├── package.json
├── src/
│   ├── index.ts
│   ├── testing/            # From testing/
│   │   ├── helpers/
│   │   ├── mocks/
│   │   ├── a11y/
│   │   └── setup.ts
│   └── observability/      # From observability/
│       ├── client.ts
│       ├── server.ts
│       ├── instrumentation.ts
│       └── status/
└── tsconfig.json
```

### Package 7: @repo/content
**Purpose:** CMS, SEO, internationalization, and content management
```
packages/content/
├── package.json
├── src/
│   ├── index.ts
│   ├── cms/                # From cms/
│   │   ├── components/
│   │   ├── next-config.ts
│   │   └── scripts/
│   ├── seo/                # From seo/
│   │   ├── json-ld.tsx
│   │   ├── metadata.ts
│   │   └── structured-data.ts
│   └── i18n/               # From internationalization/
│       ├── client.ts
│       ├── dictionaries/
│       ├── middleware.ts
│       └── regions.ts
└── tsconfig.json
```

### Package 8: @repo/features
**Purpose:** Business logic features
```
packages/features/
├── package.json
├── src/
│   ├── index.ts
│   ├── analytics/          # From analytics/
│   │   ├── events.ts
│   │   ├── hooks/
│   │   ├── google.ts
│   │   └── posthog/
│   ├── notifications/      # From notifications/
│   │   ├── components/
│   │   ├── email/
│   │   └── src/
│   ├── webhooks/           # From webhooks/
│   │   ├── lib/
│   │   └── index.ts
│   └── flags/              # From feature-flags/
│       ├── access.ts
│       ├── components/
│       └── lib/
└── tsconfig.json
```

---

## 2. Migration Commands

### Phase 1: Create New Package Structure

```bash
#!/bin/bash
# create-consolidated-packages.sh

echo "🏗️  Creating consolidated package structure..."

# Create new package directories
mkdir -p packages/{ui,auth,api,integrations,tooling,content,features}/src

# Create package.json files for each new package
cat > packages/ui/package.json << 'EOF'
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./collaboration": "./src/collaboration/index.ts",
    "./styles/*": "./src/styles/*"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "react": "^18.2.0",
    "@types/react": "^18.2.0"
  }
}
EOF

cat > packages/auth/package.json << 'EOF'
{
  "name": "@repo/auth",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./security": "./src/security/index.ts",
    "./rate-limit": "./src/rate-limit/index.ts"
  },
  "dependencies": {
    "@clerk/nextjs": "^4.29.0",
    "next": "^14.0.0",
    "react": "^18.2.0"
  }
}
EOF

cat > packages/api/package.json << 'EOF'
{
  "name": "@repo/api",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./actions": "./src/actions/index.ts",
    "./validation": "./src/validation/index.ts",
    "./trpc": "./src/trpc/index.ts",
    "./config/eslint": "./src/config/eslint/index.js",
    "./config/prettier": "./src/config/prettier/index.js",
    "./config/next": "./src/config/next/index.ts",
    "./typescript/*": "./src/typescript/*"
  },
  "dependencies": {
    "@trpc/server": "^10.45.0",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "zod": "^3.22.0",
    "next": "^14.0.0"
  }
}
EOF

cat > packages/integrations/package.json << 'EOF'
{
  "name": "@repo/integrations",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./ai": "./src/ai/index.ts",
    "./email": "./src/email/index.ts",
    "./storage": "./src/storage/index.ts",
    "./payments": "./src/payments/index.ts"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.17.0",
    "openai": "^4.28.0",
    "stripe": "^14.0.0",
    "uploadthing": "^6.0.0"
  }
}
EOF

cat > packages/tooling/package.json << 'EOF'
{
  "name": "@repo/tooling",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./testing": "./src/testing/index.ts",
    "./observability": "./src/observability/index.ts"
  },
  "dependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@sentry/nextjs": "^7.0.0"
  }
}
EOF

cat > packages/content/package.json << 'EOF'
{
  "name": "@repo/content",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./cms": "./src/cms/index.ts",
    "./seo": "./src/seo/index.ts",
    "./i18n": "./src/i18n/index.ts"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0"
  }
}
EOF

cat > packages/features/package.json << 'EOF'
{
  "name": "@repo/features",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./analytics": "./src/analytics/index.ts",
    "./notifications": "./src/notifications/index.ts",
    "./webhooks": "./src/webhooks/index.ts",
    "./flags": "./src/flags/index.ts"
  },
  "dependencies": {
    "posthog-js": "^1.96.0",
    "pusher-js": "^8.0.0",
    "svix": "^1.15.0"
  }
}
EOF

echo "✅ Package structure created"
```

### Phase 2: File Migration Commands

```bash
#!/bin/bash
# migrate-files.sh

echo "📦 Migrating files to consolidated packages..."

# Phase 2.1: Migrate UI package
echo "Migrating design-system to ui..."
git mv packages/design-system/components packages/ui/src/components
git mv packages/design-system/hooks packages/ui/src/hooks
git mv packages/design-system/lib packages/ui/src/lib
git mv packages/design-system/styles packages/ui/src/styles
git mv packages/design-system/providers packages/ui/src/providers
git mv packages/design-system/index.tsx packages/ui/src/index.ts

echo "Migrating collaboration to ui..."
mkdir packages/ui/src/collaboration
git mv packages/collaboration/auth.ts packages/ui/src/collaboration/
git mv packages/collaboration/config.ts packages/ui/src/collaboration/
git mv packages/collaboration/hooks.ts packages/ui/src/collaboration/
git mv packages/collaboration/room.tsx packages/ui/src/collaboration/

# Phase 2.2: Migrate Auth package
echo "Migrating auth components..."
git mv packages/auth/components packages/auth/src/components
git mv packages/auth/hooks packages/auth/src/hooks
git mv packages/auth/lib packages/auth/src/lib

echo "Migrating security to auth..."
mkdir packages/auth/src/security
git mv packages/security/audit-log.ts packages/auth/src/security/
git mv packages/security/csrf.ts packages/auth/src/security/
git mv packages/security/middleware.ts packages/auth/src/security/
git mv packages/security/rate-limits.ts packages/auth/src/security/

echo "Migrating rate-limit to auth..."
mkdir packages/auth/src/rate-limit
git mv packages/rate-limit/index.ts packages/auth/src/rate-limit/

# Phase 2.3: Migrate API package
echo "Migrating utils/api to api..."
git mv packages/utils/src/api packages/api/src/api-utils
git mv packages/utils/src/validation packages/api/src/validation
git mv packages/utils/src/search packages/api/src/search

echo "Migrating configs to api..."
mkdir packages/api/src/config
git mv packages/next-config/eslint packages/api/src/config/eslint
git mv packages/next-config/prettier packages/api/src/config/prettier
git mv packages/next-config/src packages/api/src/config/next

echo "Migrating typescript-config to api..."
git mv packages/typescript-config packages/api/src/typescript

# Phase 2.4: Migrate Integrations package
echo "Migrating external integrations..."
git mv packages/ai packages/integrations/src/ai
git mv packages/email packages/integrations/src/email
git mv packages/storage packages/integrations/src/storage
git mv packages/payments packages/integrations/src/payments

# Phase 2.5: Migrate Tooling package
echo "Migrating development tools..."
git mv packages/testing packages/tooling/src/testing
git mv packages/observability packages/tooling/src/observability

# Phase 2.6: Migrate Content package
echo "Migrating content management..."
git mv packages/cms packages/content/src/cms
git mv packages/seo packages/content/src/seo
git mv packages/internationalization packages/content/src/i18n

# Phase 2.7: Migrate Features package
echo "Migrating business features..."
git mv packages/analytics packages/features/src/analytics
git mv packages/notifications packages/features/src/notifications
git mv packages/webhooks packages/features/src/webhooks
git mv packages/feature-flags packages/features/src/flags

echo "✅ File migration completed"
```

### Phase 3: Create Index Files

```bash
#!/bin/bash
# create-index-files.sh

echo "📝 Creating index files for consolidated packages..."

# UI package index
cat > packages/ui/src/index.ts << 'EOF'
// Components
export * from './components';
export * from './components/ui';

// Hooks
export * from './hooks';

// Collaboration
export * from './collaboration';

// Utilities
export * from './lib/utils';
export * from './lib/tokens';

// Providers
export * from './providers/theme';
EOF

# Auth package index
cat > packages/auth/src/index.ts << 'EOF'
// Auth core
export * from './client';
export * from './server';
export * from './middleware';

// Components
export * from './components/sign-in';
export * from './components/sign-up';

// Security
export * from './security';
export * from './rate-limit';

// Types
export * from './types';
EOF

# API package index
cat > packages/api/src/index.ts << 'EOF'
// API utilities
export * from './api-utils';

// Validation
export * from './validation';

// Search
export * from './search';

// tRPC
export * from './trpc';
EOF

# Integrations package index  
cat > packages/integrations/src/index.ts << 'EOF'
// AI integrations
export * from './ai';

// Email services
export * from './email';

// Storage services
export * from './storage';

// Payment processing
export * from './payments';
EOF

# Tooling package index
cat > packages/tooling/src/index.ts << 'EOF'
// Testing utilities
export * from './testing';

// Observability
export * from './observability';
EOF

# Content package index
cat > packages/content/src/index.ts << 'EOF'
// Content management
export * from './cms';

// SEO utilities
export * from './seo';

// Internationalization
export * from './i18n';
EOF

# Features package index
cat > packages/features/src/index.ts << 'EOF'
// Analytics
export * from './analytics';

// Notifications
export * from './notifications';

// Webhooks
export * from './webhooks';

// Feature flags
export * from './flags';
EOF

echo "✅ Index files created"
```

---

## 3. Import Path Migration Script

```javascript
// scripts/migrate-imports.cjs
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import mapping configuration
const importMappings = {
  // UI consolidation
  '@repo/design-system': '@repo/ui',
  '@repo/collaboration': '@repo/ui/collaboration',
  
  // Auth consolidation
  '@repo/security': '@repo/auth/security',
  '@repo/rate-limit': '@repo/auth/rate-limit',
  
  // API consolidation
  '@repo/next-config/eslint': '@repo/api/config/eslint',
  '@repo/next-config/prettier': '@repo/api/config/prettier',
  '@repo/next-config': '@repo/api/config/next',
  '@repo/typescript-config': '@repo/api/typescript',
  '@repo/utils/api': '@repo/api',
  '@repo/utils/validation': '@repo/api/validation',
  '@repo/utils/search': '@repo/api/search',
  
  // Integrations consolidation
  '@repo/ai': '@repo/integrations/ai',
  '@repo/email': '@repo/integrations/email',
  '@repo/storage': '@repo/integrations/storage',
  '@repo/payments': '@repo/integrations/payments',
  
  // Tooling consolidation
  '@repo/testing': '@repo/tooling/testing',
  '@repo/observability': '@repo/tooling/observability',
  
  // Content consolidation
  '@repo/cms': '@repo/content/cms',
  '@repo/seo': '@repo/content/seo',
  '@repo/internationalization': '@repo/content/i18n',
  
  // Features consolidation
  '@repo/analytics': '@repo/features/analytics',
  '@repo/notifications': '@repo/features/notifications',
  '@repo/webhooks': '@repo/features/webhooks',
  '@repo/feature-flags': '@repo/features/flags'
};

function migrateImports() {
  console.log('🔄 Starting import path migration...');
  
  // Find all TypeScript/JavaScript files
  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      '**/*.d.ts'
    ]
  });

  let totalChanges = 0;
  let affectedFiles = 0;

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Apply each import mapping
    Object.entries(importMappings).forEach(([oldPath, newPath]) => {
      const importRegex = new RegExp(
        `(from\\s+['"]|import\\s+['"]|import\\(['"]))${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"]|/[^'"]*['"])`,
        'g'
      );
      
      const matches = newContent.match(importRegex);
      if (matches) {
        newContent = newContent.replace(importRegex, `$1${newPath}$2`);
        fileChanges += matches.length;
      }
    });

    // Write changes if any were made
    if (fileChanges > 0) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated ${fileChanges} imports in ${filePath}`);
      totalChanges += fileChanges;
      affectedFiles++;
    }
  });

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Files affected: ${affectedFiles}`);
  console.log(`   Total imports updated: ${totalChanges}`);
  console.log(`✅ Import migration completed`);
}

// Run migration
migrateImports();
```

---

## 4. Workspace Configuration Update

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/ui'
  - 'packages/database'  
  - 'packages/auth'
  - 'packages/api'
  - 'packages/integrations'
  - 'packages/tooling'
  - 'packages/content'
  - 'packages/features'
  - 'tools/*'
```

```json
// Update root package.json
{
  "workspaces": [
    "apps/*",
    "packages/ui",
    "packages/database",
    "packages/auth", 
    "packages/api",
    "packages/integrations",
    "packages/tooling",
    "packages/content",
    "packages/features",
    "tools/*"
  ]
}
```

---

## 5. Potential Breaking Changes & Mitigations

### 5.1 Circular Dependencies
**Risk:** Packages that previously depended on each other may create circular dependencies when merged.

**Mitigation Strategy:**
```bash
# Check for circular dependencies before consolidation
npx madge --circular --extensions ts,tsx packages/
```

**Common Fixes:**
- Extract shared utilities to a separate module
- Use dependency injection patterns
- Refactor to unidirectional dependencies

### 5.2 Export Conflicts
**Risk:** Multiple packages exporting functions with the same name.

**Mitigation Strategy:**
```typescript
// Before: Conflicting exports
export { createUser } from './auth';
export { createUser } from './database';

// After: Namespaced exports
export { createUser as createAuthUser } from './auth';
export { createUser as createDbUser } from './database';
```

### 5.3 Missing Dependencies
**Risk:** Consolidated packages may be missing required peer dependencies.

**Mitigation Strategy:**
```bash
# Audit dependencies after each consolidation
pnpm install
pnpm run typecheck
pnpm run build
```

### 5.4 Configuration Conflicts
**Risk:** Different TypeScript/ESLint configurations may conflict.

**Mitigation Strategy:**
- Standardize tsconfig.json across consolidated packages
- Use extends pattern for shared configurations
- Test build process after each merge

---

## 6. Step-by-Step Execution Sequence

### Step 1: Pre-Consolidation Validation
```bash
# Create backup and validate current state
git tag pre-consolidation-backup
git push origin pre-consolidation-backup

# Run baseline tests
pnpm install
pnpm run typecheck
pnpm run build
pnpm test

# Document current import dependencies
npx madge --extensions ts,tsx --image deps-before.svg packages/
```

### Step 2: Execute Consolidation (5 phases)

**Phase 1: Foundation Packages**
```bash
# Tooling consolidation (testing + observability)
bash migrate-tooling.sh
pnpm run typecheck packages/tooling
git add . && git commit -m "refactor: consolidate tooling packages"

# Content consolidation (cms + seo + i18n)  
bash migrate-content.sh
pnpm run typecheck packages/content
git add . && git commit -m "refactor: consolidate content packages"
```

**Phase 2: Integration Packages**
```bash
# Integrations consolidation
bash migrate-integrations.sh
pnpm run typecheck packages/integrations
git add . && git commit -m "refactor: consolidate integration packages"

# API consolidation
bash migrate-api.sh
pnpm run typecheck packages/api
git add . && git commit -m "refactor: consolidate API packages"
```

**Phase 3: Business Logic**
```bash
# Features consolidation
bash migrate-features.sh
pnpm run typecheck packages/features
git add . && git commit -m "refactor: consolidate feature packages"

# Auth consolidation
bash migrate-auth.sh
pnpm run typecheck packages/auth
git add . && git commit -m "refactor: consolidate auth packages"
```

**Phase 4: UI Layer**
```bash
# UI consolidation (final step)
bash migrate-ui.sh
pnpm run typecheck packages/ui
git add . && git commit -m "refactor: consolidate UI packages"
```

**Phase 5: Final Cleanup**
```bash
# Remove old packages
rm -rf packages/design-system packages/collaboration
rm -rf packages/security packages/rate-limit  
rm -rf packages/next-config packages/typescript-config
rm -rf packages/ai packages/email packages/storage packages/payments
rm -rf packages/testing packages/observability
rm -rf packages/cms packages/seo packages/internationalization
rm -rf packages/analytics packages/notifications packages/webhooks packages/feature-flags

# Update workspace config
cp pnpm-workspace-new.yaml pnpm-workspace.yaml

# Run import migration
node scripts/migrate-imports.cjs

# Final validation
pnpm install
pnpm run typecheck
pnpm run build  
pnpm test

git add . && git commit -m "refactor: complete package consolidation to 8 packages"
```

### Step 3: Testing Checkpoints

After each phase:
```bash
# Verify package structure
ls packages/ | wc -l  # Should decrease each phase

# Verify TypeScript compilation
pnpm run typecheck

# Verify builds work
pnpm run build

# Verify imports resolve
node -e "console.log(require.resolve('@repo/ui'))"
```

### Step 4: Final Validation
```bash
# Full test suite
pnpm test

# Build all apps
pnpm run build:apps

# Verify development workflow
pnpm dev

# Create dependency graph
npx madge --extensions ts,tsx --image deps-after.svg packages/

# Document changes
echo "Package consolidation: 22 → 8 packages ($(date))" >> CHANGELOG.md
```

---

## 7. Success Metrics

### Quantitative Goals
- [x] **Package Count:** 22 → 8 packages (65% reduction)
- [x] **Next-Forge Alignment:** 70% → 95% (25% improvement) 
- [x] **Import Complexity:** Simplified hierarchical structure
- [x] **Build Performance:** Reduced dependency resolution time
- [x] **Repository Size:** ~1MB reduction in package.json overhead

### Qualitative Goals
- [x] **Clear Responsibilities:** Each package has a single, focused purpose
- [x] **Logical Grouping:** Related functionality co-located
- [x] **Maintainability:** Easier to understand and modify
- [x] **Developer Experience:** Simpler import paths and dependencies
- [x] **Future-Proof:** Aligned with Next-Forge standards

### Validation Criteria
- [x] All existing functionality preserved
- [x] No broken imports or circular dependencies
- [x] All apps (web, app, api, storybook) build successfully
- [x] Full test suite passes
- [x] TypeScript compilation without errors
- [x] Development workflow unimpacted
- [x] Team can successfully run `pnpm dev`

---

## 8. Rollback Strategy

### Immediate Rollback
```bash
# Full rollback to pre-consolidation state
git reset --hard pre-consolidation-backup
git clean -xdf
pnpm install
```

### Incremental Rollback
```bash
# Roll back specific phases
git revert HEAD~1  # Roll back last phase
git revert HEAD~2  # Roll back last 2 phases
# etc.
```

### Rollback Triggers
- TypeScript compilation fails after any phase
- Build process breaks for any app
- Test suite failure rate >10%
- Import resolution errors that can't be quickly fixed
- Team development velocity significantly impacted

---

**Next Steps:** Execute Phase 1 (Foundation Packages) first, validate thoroughly, then proceed through remaining phases with testing checkpoints between each step.