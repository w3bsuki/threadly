# CLAUDE.md

Threadly - Premium C2C fashion marketplace. Next-Forge turborepo monorepo.

## Architecture
- apps/web: Customer marketplace (3001)
- apps/app: Seller dashboard (3000)  
- apps/api: Backend services (3002)
- packages/*: Shared functionality

## Import Rules
- Use @repo/* imports only
- No deep imports
- workspace:* for internal packages

## Next.js 15 Patterns
- Await params: `const { id } = await params`
- Server components by default
- Server actions for mutations
- No client-side data fetching

## TypeScript
- NO any types
- Zod validation for inputs
- Prisma types for models
- Strict mode enabled

## Database
- Use transactions for related ops
- Include necessary relations
- Prevent N+1 queries

## Commands
- pnpm dev
- pnpm build  
- pnpm typecheck
- pnpm db:push
- pnpm db:studio
- pnpm tsx scripts/sync-algolia.ts (sync existing products to Algolia)

## Quality Gates
- Zero typecheck errors
- No console.log
- No any types
- Clean lint

## Security
- Zod validation on all inputs
- Clerk auth on protected routes
- Rate limiting with @repo/security
- Sanitize for XSS

## Performance
- Cache expensive queries (Redis)
- Include relations upfront
- Dynamic imports for code splitting
- Next.js Image component

## Environment
- Packages validate own env vars
- Apps compose package envs
- Use createEnv pattern

## Dependencies
- NEVER remove without verification
- Check imports 3x before removal
- Dependencies may be used indirectly
- When in doubt, keep it

## Code Style
- No comments unless requested
- Follow existing patterns
- Use existing libraries

## Workflow
- Read docs before coding
- Update PROJECT_CONTEXT.md after tasks
- Run typecheck after changes
- Commit only when asked