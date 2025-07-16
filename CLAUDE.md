# CLAUDE.md

Threadly - Premium C2C fashion marketplace monorepo.

## WORKFLOW
1. **PLAN** - Analyze requirements thoroughly
2. **REVIEW** - Identify edge cases
3. **EXECUTE** - Zero bloat, production-ready
4. **VERIFY** - Run typecheck/build

## RULES
- NO any types, console.log, or comments
- NO proactive file creation
- MUST run typecheck after changes
- MUST follow existing patterns
- Commit ONLY when asked
- Refer to next-forge.com docs when stuck

## TECH
- Next.js 15 App Router (Server Components default)
- Turborepo + pnpm workspaces
- Prisma + PostgreSQL + Redis (Upstash)
- Clerk auth + Stripe payments
- Vercel deployment

## COMMANDS
```bash
pnpm dev         # Start all apps
pnpm build       # Build monorepo
pnpm typecheck   # Must pass
pnpm db:push     # Deploy schema
```

## PATTERNS
- Await params: `const { id } = await params`
- Use @repo/* imports exclusively
- cache.remember() for Redis
- Zod validation on ALL inputs
- Include DB relations upfront