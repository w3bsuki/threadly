# CLAUDE.md

Threadly - Premium C2C fashion marketplace. Turborepo monorepo deployed on Vercel.

## DEPLOYMENT
- apps/web: Customer marketplace (vercel.com)
- apps/app: Seller dashboard (vercel.com)
- apps/api: Backend services (vercel.com)
- Monorepo: All apps deploy from single repo

## DEVOPS WORKFLOW (STRICT)
1. **PLAN**: Read requirements, analyze codebase
2. **ITERATE/REVIEW**: Review plan, identify edge cases
3. **EXECUTE**: Implement with zero bloat
4. **REVIEW**: Verify correctness, run typecheck/build

Work SLOW. Think before coding. Production-ready only.

## CRITICAL RULES
- NO any types
- NO console.log
- NO comments unless requested
- NO proactive file creation
- MUST run typecheck after changes
- MUST follow existing patterns
- Commit ONLY when explicitly asked

## Architecture
- Next.js 15 App Router
- Server Components default
- Await params: `const { id } = await params`
- Use @repo/* imports only
- Prisma + PostgreSQL
- Redis cache (Upstash)
- Clerk auth

## Commands
```bash
pnpm dev         # Development
pnpm build       # Build all apps
pnpm typecheck   # Must pass
pnpm db:push     # Deploy schema
```

## Performance Checklist
- Include DB relations upfront
- Use cache.remember() pattern
- Dynamic imports for heavy libs
- Image optimization required
- Cursor pagination for lists

## Security
- Zod validation on ALL inputs
- Protected routes via middleware
- Rate limiting enabled
- Sanitize user content