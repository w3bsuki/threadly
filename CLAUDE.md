# CLAUDE.md

Next-Forge turborepo monorepo. Follow these patterns exactly.

## Project Overview

**Threadly** - Premium C2C fashion marketplace built with Next.js 15, TypeScript, and Turborepo.

## Architecture

```
apps/
├── web/          # Customer marketplace (port 3001)
├── app/          # Seller dashboard (port 3000)
└── api/          # Backend services (port 3002)

packages/
├── database/     # Prisma ORM
├── design-system/# shadcn/ui components
├── auth/         # Clerk authentication
├── cache/        # Redis (Upstash)
├── observability/# Sentry + logging
└── [others]/     # Feature-specific packages
```

## Next-Forge Patterns

### Package Exports
```json
// packages/[name]/package.json
{
  "exports": {
    ".": "./index.ts",
    "./server": "./server.ts",
    "./client": "./client.tsx"
  }
}
```

### Import Rules
```typescript
// ✅ CORRECT
import { Button } from '@repo/design-system/components';
import { auth } from '@repo/auth/server';

// ❌ WRONG - No deep imports
import { Button } from '@repo/design-system/components/ui/button';
```

### Cross-Package Dependencies
- Packages must declare all dependencies in package.json
- No circular dependencies
- Use `workspace:*` for internal packages

## Next.js 15 Patterns

### Async Params (BREAKING CHANGE)
```typescript
// app/[id]/page.tsx
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; // MUST AWAIT
}
```

### Server Components by Default
```typescript
// ✅ Data fetching in server components
export async function ProductList() {
  const products = await database.product.findMany();
  return <ProductGrid products={products} />;
}

// ❌ WRONG - Client-side data fetching
'use client';
useEffect(() => { fetch('/api/products') }, []);
```

### Server Actions
```typescript
'use server';

export async function createProduct(data: FormData) {
  const user = await auth();
  if (!user) throw new Error('Unauthorized');
  
  const validated = productSchema.parse(data);
  return database.product.create({ data: validated });
}
```

## TypeScript Requirements

- **NO `any` types** - Use `unknown` with type guards
- **Zod validation** for all user inputs
- **Prisma types** for database models
- **Strict mode** enabled

## Database Patterns

```typescript
// Use transactions for related operations
await database.$transaction(async (tx) => {
  const order = await tx.order.create({ data });
  await tx.product.update({ 
    where: { id }, 
    data: { status: 'SOLD' } 
  });
  return order;
});

// Always include necessary relations
const product = await database.product.findUnique({
  where: { id },
  include: { 
    seller: true, 
    images: true,
    category: true 
  }
});
```

## Caching Strategy

```typescript
import { getCacheService } from '@repo/cache';

const cache = getCacheService();

// Cache expensive operations
const data = await cache.remember(
  `product:${id}`,
  () => database.product.findUnique({ where: { id } }),
  300 // 5 minutes
);
```

## Commands

```bash
pnpm dev        # Start development
pnpm build      # Production build
pnpm typecheck  # Must pass before commit
pnpm db:push    # Update database schema
pnpm db:studio  # Database browser
```

## Security Patterns

- **Zod validation** on all inputs
- **Clerk auth** on protected routes  
- **Rate limiting** with @repo/security
- **SQL injection prevention** via Prisma
- **XSS protection** with sanitization

## Performance

- **Cache first** - Redis for expensive queries
- **Include relations** - Avoid N+1 queries
- **Image optimization** - Next.js Image component
- **Bundle splitting** - Dynamic imports
- **Edge runtime** where applicable

## Error Handling

```typescript
import { parseError } from '@repo/observability/server';

try {
  // operation
} catch (error) {
  const message = parseError(error);
  return NextResponse.json({ error: message }, { status: 500 });
}
```

## Environment Variables

Each package validates its own env vars:
```typescript
// packages/auth/keys.ts
export const keys = () => createEnv({
  server: {
    CLERK_SECRET_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  }
});
```

Apps compose package envs:
```typescript
// apps/app/env.ts
export const env = createEnv({
  extends: [auth(), database(), cache()],
  server: { /* app-specific */ }
});
```

## Quality Gates

Before commits:
- `pnpm typecheck` - Zero errors
- `pnpm lint` - Clean code
- `pnpm build` - Successful build
- No `console.log` in production
- No `any` types

## Documentation Usage

**ALWAYS read documentation before starting any task:**
- **`/PROJECT_CONTEXT.md`** - Single source of truth for current state, progress, and priorities
- **`/docs/next-forge-reference/`** - Architecture patterns and technical guidelines
- **`/docs/agent-templates.md`** - Templates for spawning parallel agents
- **`/docs/deployment/`** - DevOps and deployment procedures

### Documentation Update Protocol
After EVERY significant task:
1. Update relevant sections in PROJECT_CONTEXT.md
2. Mark completed items in the progress tracking
3. Document any new patterns or technical decisions
4. Update metrics if they've changed

## Agent Orchestration

When using the Task tool to spawn agents for parallel work:

### Agent Deployment Guidelines
1. **Read PROJECT_CONTEXT.md first** - Understand current priorities and blockers
2. **Use appropriate template** from `/docs/agent-templates.md`
3. **Assign clear working directories** - Prevent conflicts
4. **Define measurable success criteria** - Enable progress tracking
5. **Require documentation updates** - Keep PROJECT_CONTEXT.md current

### Example Agent Usage
```
Task Description: "Fix seller dashboard functionality"
Prompt: [Use Dashboard Agent Template with specific tasks:
- Fix missing safeDecimalToNumber function
- Remove mock data from analytics
- Implement real-time updates]
```

### Coordination Rules
- Launch complementary agents (e.g., Web + API agents)
- Avoid overlapping work areas
- Review agent updates before proceeding
- Monitor PROJECT_CONTEXT.md for progress

### Agent Capabilities Matrix
| Agent Type | Focus Area | Can Modify | Updates Required |
|------------|------------|------------|------------------|
| Web App | /apps/web | Frontend code | UI/UX progress |
| Dashboard | /apps/app | Seller features | Feature status |
| API | /apps/api | Backend logic | Security status |
| Testing | All areas | Test files | Coverage metrics |
| Performance | All areas | Optimizations | Performance data |

## Documentation Philosophy

- **PROJECT_CONTEXT.md is the single source of truth** - Always current
- **Read before you code** - Context prevents mistakes
- **Update after you code** - Keep others informed
- **Archive completed work** - Maintain clean workspace

## CRITICAL: DEPENDENCY MANAGEMENT RULES

**NEVER remove or downgrade dependencies without absolute certainty they are unused.**

### Rules:
1. **Dependencies installed by Next-Forge are sacred** - They're part of the scaffold for a reason
2. **Verify THREE times before removal**:
   - Check all imports with grep
   - Check CSS files, config files, and build scripts
   - Check for indirect usage through other packages
3. **When in doubt, KEEP IT** - Unused deps are better than broken builds
4. **Focus on REAL problems first**:
   - Security vulnerabilities
   - Performance bottlenecks
   - Actual bugs affecting users
5. **NEVER trust surface-level analysis** - Dependencies can be used in non-obvious ways

### Remember:
Breaking working code by removing "unused" dependencies is infinitely worse than having a slightly larger bundle. The audit identified real issues - focus on those, not phantom dependency problems.