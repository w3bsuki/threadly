# Next-Forge Migration Analysis & Plan

## Executive Summary

This document analyzes the current Threadly monorepo structure and provides a comprehensive migration plan to align with Next-Forge's simplified architecture. The migration will consolidate 30 packages into 6, maintain all functionality, and improve developer experience.

## 1. Structure Comparison

### Current Threadly Structure (30 packages)

```
apps/
  ├── web/          ✓ Keep (main application)
  ├── api/          ✓ Keep (tRPC microservice)
  ├── app/          ✗ Merge into web
  ├── docs/         ✓ Keep (optional)
  └── storybook/    ✓ Keep (optional)

packages/
  ├── analytics/            → Merge into utils
  ├── api-utils/            → Merge into utils  
  ├── auth/                 ✓ Keep as-is
  ├── cache/                → Merge into utils
  ├── cart/                 → Merge into ui
  ├── checkout/             → Merge into ui
  ├── cms/                  → Merge into utils
  ├── collaboration/        → Merge into utils
  ├── commerce/             → Merge into utils
  ├── database/             ✓ Keep as-is
  ├── design-system/        → Rename to ui
  ├── email/                → Merge into utils
  ├── error-handling/       → Merge into utils
  ├── feature-flags/        → Merge into utils
  ├── internationalization/ → Merge into utils
  ├── messaging/            → Merge into ui
  ├── next-config/          → Merge into config
  ├── notifications/        → Merge into utils
  ├── observability/        → Merge into utils
  ├── payments/             → Merge into utils
  ├── rate-limit/           → Merge into utils
  ├── real-time/            → Merge into utils
  ├── search/               → Merge into utils
  ├── security/             → Merge into utils
  ├── seo/                  → Merge into utils
  ├── server-actions/       → Merge into utils
  ├── testing/              → Remove (use root)
  ├── typescript-config/    → Move to config
  ├── utils/                ✓ Keep & expand
  ├── validation/           ✓ Keep (optional)
  └── webhooks/             → Merge into utils
```

### Target Next-Forge Structure (6 packages)

```
apps/
  ├── web/       # Combined web + app
  ├── api/       # tRPC microservice
  ├── docs/      # Documentation (optional)
  └── storybook/ # Component docs (optional)

packages/
  ├── ui/        # All UI components (from design-system + cart + checkout + messaging)
  ├── config/    # All configs (eslint, prettier, typescript, next)
  ├── utils/     # All utilities (20+ packages merged)
  ├── auth/      # Authentication logic
  ├── database/  # Prisma client
  └── validation/# Zod schemas (optional)
```

## 2. Migration Checklist

### Phase 1: Preparation (Low Risk)
- [ ] Create full backup of current repository
- [ ] Document all custom configurations
- [ ] List all environment variables used
- [ ] Ensure all tests are passing
- [ ] Tag current version for rollback

### Phase 2: Package Consolidation (Medium Risk)

#### 2.1 Create Core Package Structure
```bash
# Create new package directories
mkdir -p packages/ui/src
mkdir -p packages/config
mkdir -p packages/utils/src/{analytics,api,cache,cms,commerce,email,errors,features,i18n,notifications,observability,payments,rate-limit,realtime,search,security,seo,server,webhooks}
```

#### 2.2 Merge UI Packages
```bash
# Move design-system → ui
cp -r packages/design-system/* packages/ui/
mv packages/ui/components packages/ui/src/components
mv packages/ui/lib packages/ui/src/lib

# Merge cart, checkout, messaging into ui
cp -r packages/cart/components/* packages/ui/src/components/cart/
cp -r packages/checkout/components/* packages/ui/src/components/checkout/
cp -r packages/messaging/components/* packages/ui/src/components/messaging/
```

#### 2.3 Merge Utility Packages
```bash
# Move each utility package into utils subdirectory
cp -r packages/analytics/* packages/utils/src/analytics/
cp -r packages/api-utils/* packages/utils/src/api/
cp -r packages/cache/* packages/utils/src/cache/
# ... repeat for all utility packages
```

#### 2.4 Consolidate Configs
```bash
# Move configs to config package
mv packages/typescript-config/* packages/config/typescript/
mv packages/next-config/* packages/config/next/
cp .eslintrc.* packages/config/eslint/
cp prettier.config.* packages/config/prettier/
```

### Phase 3: Update Import Paths (High Risk)

#### 3.1 Update Package.json Files
```json
// packages/ui/package.json
{
  "name": "@repo/ui",
  "exports": {
    "./components": "./src/components/index.ts",
    "./lib": "./src/lib/index.ts",
    "./styles": "./src/styles/globals.css"
  }
}

// packages/utils/package.json
{
  "name": "@repo/utils",
  "exports": {
    "./analytics": "./src/analytics/index.ts",
    "./api": "./src/api/index.ts",
    "./cache": "./src/cache/index.ts",
    // ... all utility exports
  }
}
```

#### 3.2 Create Import Migration Script
```typescript
// scripts/migrate-imports.ts
const importMappings = {
  '@repo/design-system/components': '@repo/ui/components',
  '@repo/cart': '@repo/ui/components',
  '@repo/checkout': '@repo/ui/components',
  '@repo/messaging': '@repo/ui/components',
  '@repo/analytics': '@repo/utils/analytics',
  '@repo/api-utils': '@repo/utils/api',
  '@repo/cache': '@repo/utils/cache',
  // ... all mappings
};

// Run with: tsx scripts/migrate-imports.ts
```

### Phase 4: Merge Apps (High Risk)

#### 4.1 Analyze App Differences
- [ ] Compare routing structures
- [ ] Identify platform-specific features
- [ ] Document conditional logic needed

#### 4.2 Create Platform Detection
```typescript
// apps/web/lib/platform.ts
export const platform = {
  isWeb: !navigator.userAgent.includes('ThreadlyApp'),
  isApp: navigator.userAgent.includes('ThreadlyApp'),
};
```

#### 4.3 Merge App Routes
```bash
# Copy app-specific routes
cp -r apps/app/app/mobile-only/* apps/web/app/(platform)/app/
```

### Phase 5: Cleanup (Low Risk)
- [ ] Remove old package directories
- [ ] Update workspace configuration
- [ ] Update CI/CD pipelines
- [ ] Update documentation

## 3. Migration Commands

### Automated Migration Script
```bash
#!/bin/bash
# migrate-to-next-forge.sh

echo "Starting Next-Forge migration..."

# Step 1: Backup
git checkout -b pre-next-forge-migration
git add -A && git commit -m "Backup: Pre Next-Forge migration"

# Step 2: Create new structure
mkdir -p packages/{ui,config,utils}/src

# Step 3: Run import migration
pnpm tsx scripts/migrate-imports.ts

# Step 4: Update package.json files
pnpm tsx scripts/update-package-configs.ts

# Step 5: Test
pnpm install
pnpm typecheck
pnpm build

echo "Migration complete!"
```

### Rollback Commands
```bash
# If migration fails
git checkout main
git branch -D next-forge-migration
rm -rf packages/{ui,config,utils}
git checkout -- .
pnpm install
```

## 4. Risk Assessment

### High Risk Areas

#### 1. Import Path Changes
**Risk**: Broken imports across entire codebase
**Mitigation**: 
- Automated migration script with mappings
- TypeScript will catch all import errors
- Run `pnpm typecheck` after each step

#### 2. App Merge Complexity
**Risk**: Platform-specific features may conflict
**Mitigation**:
- Use feature flags for platform differences
- Maintain separate routes with (platform) groups
- Gradual migration with feature parity checks

#### 3. Package Export Changes
**Risk**: Missing exports causing runtime errors
**Mitigation**:
- Create comprehensive index files
- Test all critical paths
- Use `pnpm build` to verify exports

### Medium Risk Areas

#### 1. Build Configuration
**Risk**: Build process may need adjustments
**Mitigation**:
- Update turbo.json incrementally
- Test build after each major change
- Keep build logs for debugging

#### 2. Development Workflow
**Risk**: Developer confusion during transition
**Mitigation**:
- Clear documentation
- Update README with new structure
- Provide migration guide for team

### Low Risk Areas

#### 1. Optional Apps (docs, storybook)
**Risk**: May need path updates
**Mitigation**: These can be updated last

#### 2. Configuration Files
**Risk**: Minimal, mostly path updates
**Mitigation**: Well-defined structure in config package

## 5. Breaking Changes

### For Developers

1. **Import Paths**
   ```typescript
   // Before
   import { Button } from '@repo/design-system/components/button';
   import { useCart } from '@repo/cart/hooks';
   import { rateLimit } from '@repo/rate-limit';

   // After  
   import { Button } from '@repo/ui/components';
   import { useCart } from '@repo/ui/components';
   import { rateLimit } from '@repo/utils/rate-limit';
   ```

2. **Package Names**
   - `@repo/design-system` → `@repo/ui`
   - All utility packages → `@repo/utils/*`

3. **App Routes**
   - `/app/*` routes → `/web/(platform)/app/*`
   - Shared routes remain in `/web/*`

### For CI/CD

1. **Build Commands**
   - May need to update app references
   - Simplified to just `web` and `api`

2. **Environment Variables**
   - `NEXT_PUBLIC_APP_URL` may be deprecated
   - Platform detection via user agent

## 6. Migration Timeline

### Week 1: Planning & Preparation
- Day 1-2: Team alignment and documentation
- Day 3-4: Create migration scripts and tools
- Day 5: Set up test environment

### Week 2: Package Consolidation
- Day 1-2: Merge UI packages
- Day 3-4: Merge utility packages  
- Day 5: Update imports and test

### Week 3: App Consolidation
- Day 1-2: Analyze app differences
- Day 3-4: Merge app into web
- Day 5: Platform-specific testing

### Week 4: Finalization
- Day 1-2: Update documentation
- Day 3: Update CI/CD
- Day 4: Team training
- Day 5: Production deployment

## 7. Success Metrics

### Immediate Benefits
- 80% reduction in package count (30 → 6)
- Simplified dependency management
- Faster build times
- Easier onboarding

### Long-term Benefits
- Reduced maintenance overhead
- Clearer architecture
- Better code discoverability
- Aligned with Next-Forge best practices

## 8. Rollback Strategy

### Preparation
1. Tag current version: `git tag pre-migration-v1`
2. Create migration branch: `git checkout -b next-forge-migration`
3. Document all changes in MIGRATION_LOG.md

### Rollback Steps
1. Stop all services
2. Checkout pre-migration tag
3. Clean install dependencies
4. Restart services
5. Notify team of rollback

### Rollback Triggers
- Build failures after migration
- Runtime errors in production
- Performance degradation >20%
- Critical feature breakage

## 9. Post-Migration Tasks

### Immediate
- [ ] Update all documentation
- [ ] Update developer onboarding
- [ ] Create architecture diagram
- [ ] Update CI/CD pipelines

### Week 1
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Gather developer feedback
- [ ] Fix any edge cases

### Month 1
- [ ] Remove migration scripts
- [ ] Archive old documentation
- [ ] Optimize new structure
- [ ] Plan next improvements

## 10. FAQs

### Q: Why consolidate packages?
A: Reduces complexity, improves discoverability, and aligns with Next-Forge patterns.

### Q: Will this break existing features?
A: No, all functionality is preserved, only organization changes.

### Q: How long will migration take?
A: Estimated 3-4 weeks with proper planning and testing.

### Q: Can we partially migrate?
A: Yes, package consolidation can be done incrementally.

### Q: What about custom packages?
A: Custom business logic remains in consolidated packages with clear namespacing.

## Conclusion

This migration will significantly simplify the Threadly monorepo structure while maintaining all functionality. The key to success is careful planning, automated tooling, and incremental migration with thorough testing at each step.