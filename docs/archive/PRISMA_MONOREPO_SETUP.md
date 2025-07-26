# Prisma Monorepo Setup Guide

## Overview
This guide documents the Prisma setup in the Threadly monorepo and solutions for common issues.

## Current Configuration

### Database Package Structure
```
packages/database/
├── generated/
│   └── client/           # Generated Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── src/
│   ├── index.ts         # Main exports
│   └── lib/
│       └── prisma.ts    # Prisma client singleton
└── package.json
```

### Key Configuration Details

1. **Prisma Schema** (`packages/database/prisma/schema.prisma`):
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     output        = "../generated/client"
     binaryTargets = ["native", "windows", "rhel-openssl-3.0.x"]
     engineType    = "library"
   }
   ```

2. **Package Exports** (`packages/database/package.json`):
   ```json
   "./client": {
     "types": "./generated/client/index.d.ts",
     "default": "./generated/client/index.js"
   }
   ```

3. **Import Paths**:
   - From `packages/database/src`: `import { PrismaClient } from '../generated/client'`
   - From other packages: `import { database } from '@repo/database'`

## Common Issues and Solutions

### Issue 1: ENOENT errors when copying Prisma binaries
**Error**: `ENOENT: no such file or directory, copyfile ... query_engine-windows.dll.node`

**Solution**:
1. Ensure Prisma client is generated: `cd packages/database && npm run build`
2. Use `engineType = "library"` in schema.prisma
3. Configure webpack to handle Prisma properly (already done in `packages/next-config`)

### Issue 2: Cannot find module '@prisma/client'
**Solution**:
- Import from `@repo/database` instead of `@prisma/client`
- The database package re-exports all Prisma types and the client

### Issue 3: Multiple Prisma instances
**Solution**:
- Use the singleton pattern already implemented in `packages/database/src/lib/prisma.ts`
- Import `database` from `@repo/database`

## Development Workflow

1. **Making Schema Changes**:
   ```bash
   # Edit schema
   cd packages/database
   # Generate migration
   npx prisma migrate dev --name your_migration_name
   # Generate client
   npm run build
   ```

2. **Using in Code**:
   ```typescript
   import { database } from '@repo/database';
   
   const users = await database.user.findMany();
   ```

3. **Type Safety**:
   ```typescript
   import type { User, Product } from '@repo/database';
   ```

## Troubleshooting Commands

```bash
# Regenerate Prisma client
cd packages/database && npm run build

# Run the fix script
node scripts/fix-prisma.cjs

# Check if client is generated
ls packages/database/generated/client

# Reset and regenerate
cd packages/database
rm -rf generated
npm run build
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL="your-database-connection-string"
```

Optional for Windows development in `apps/web/.env.local`:
```
PRISMA_QUERY_ENGINE_LIBRARY="../../packages/database/generated/client/query_engine-windows.dll.node"
```

## Best Practices

1. **Always use the database singleton** from `@repo/database`
2. **Run `npm run build`** in packages/database after schema changes
3. **Commit generated files** to avoid build issues in CI/CD
4. **Use transactions** for complex operations
5. **Enable query logging** in development for debugging

## CI/CD Considerations

- The `postinstall` script automatically generates the Prisma client
- Set `SKIP_PRISMA_GENERATE=true` to skip generation if needed
- Ensure `DATABASE_URL` is set in production environment

## Additional Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma in Monorepos](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-monorepo)