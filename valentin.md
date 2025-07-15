# Prisma + Neon + Vercel Monorepo Fix 🔧

**Hey Valentin!** This is the complete breakdown of what was broken and how we fixed the Prisma engine issues that prevented products from syncing between your apps.

## The Problem 💥

Your `/app` could add products, but they weren't showing up in `/web`. The error was:

```
Error: Invalid `prisma.product.findMany()` invocation:
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

This happened because Vercel's serverless environment couldn't find the Prisma query engine binary files.

## Root Causes 🔍

1. **Deprecated Configuration**: Your `schema.prisma` had `engineType: "dataproxy"` which is deprecated
2. **Missing Binary Targets**: No proper binary target for Vercel's Linux runtime
3. **Monorepo Bundling Issues**: Vercel wasn't including Prisma engine files in the deployment bundle
4. **Preview Features**: Unnecessary `previewFeatures` that weren't needed

## The Complete Fix ✅

### 1. Fixed Prisma Schema (`packages/database/prisma/schema.prisma`)

**BEFORE:**
```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../generated/client"
  previewFeatures = ["driverAdapters"]
  engineType      = "dataproxy"  // ❌ DEPRECATED!
}
```

**AFTER:**
```prisma
generator client {
  provider      = "prisma-client-js"
  output        = "../generated/client"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]  // ✅ VERCEL TARGET!
}
```

### 2. Added Monorepo Workaround Plugin

**Installed:**
```bash
pnpm add @prisma/nextjs-monorepo-workaround-plugin --save-dev -w
```

**Added to all Next.js configs** (`apps/web/next.config.ts`, `apps/app/next.config.ts`, `apps/api/next.config.ts`):

```typescript
webpack: (config, { isServer }) => {
  if (isServer) {
    // Add Prisma monorepo workaround plugin
    const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');
    config.plugins = [...config.plugins, new PrismaPlugin()];
  }
  return config;
}
```

### 3. Regenerated Prisma Client

```bash
cd packages/database && pnpm run build
```

## Why This Works 🧠

### Binary Targets Explained
- `"native"` - For local development (your machine)
- `"rhel-openssl-3.0.x"` - For Vercel's Linux runtime environment

### Monorepo Plugin Magic
- Ensures Prisma engine binaries are copied to the correct locations
- Prevents Vercel from stripping out required files during optimization
- Handles the complex file paths in monorepo structures

### Engine Type Removal
- `"dataproxy"` was for Prisma Data Proxy (old service)
- Modern Neon works better with standard binary engines
- Removes unnecessary complexity

## Key Files Changed 📁

1. `packages/database/prisma/schema.prisma` - Core Prisma config
2. `apps/web/next.config.ts` - Web app webpack config
3. `apps/app/next.config.ts` - Seller app webpack config  
4. `apps/api/next.config.ts` - API webpack config
5. `package.json` - Added the workaround plugin
6. `pnpm-lock.yaml` - Lockfile updated

## Testing Verification ✨

All apps now build successfully:
- ✅ `apps/web` builds and deploys
- ✅ `apps/app` builds and deploys
- ✅ `apps/api` builds and deploys
- ✅ Products sync between apps

## For Future Reference 📚

### If You See This Error Again:
```
Prisma Client could not locate the Query Engine
```

**Check these things:**
1. Are binary targets set correctly in `schema.prisma`?
2. Is the monorepo plugin installed and configured?
3. Did you run `prisma generate` after schema changes?
4. Are you using deprecated `engineType` settings?

### Essential Commands:
```bash
# Regenerate Prisma client
cd packages/database && pnpm run build

# Test all builds
pnpm build

# Check for issues
pnpm typecheck
```

### Vercel-Specific Notes:
- Always include `rhel-openssl-3.0.x` binary target
- Use the monorepo workaround plugin for complex setups
- Keep `serverExternalPackages` for Prisma packages

## The Magic Formula 🪄

For Prisma + Neon + Vercel + Monorepo:
1. **Binary Targets** → Correct runtime support
2. **Monorepo Plugin** → Proper file bundling  
3. **Clean Schema** → Remove deprecated options
4. **Regenerate Client** → Apply all changes

That's it! Your products now flow perfectly from `/app` to `/web` because Prisma can find its engine files in production. 

Keep this handy for future deployments! 💪

---
*Fixed on 2025-07-14 with lots of research and determination* 🚀