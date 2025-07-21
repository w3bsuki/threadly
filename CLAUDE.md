# CLAUDE.md

## RULES
- NO any types, console.log, or comments
- NO proactive file creation
- MUST run typecheck after changes
- Import types from @repo/validation/schemas
- Commit ONLY when asked

## COMMANDS
```bash
pnpm dev         # Start all apps
pnpm build       # Build monorepo
pnpm typecheck   # Must pass
```

## PATTERNS
- Await params: `const { id } = await params`
- Use @repo/* imports exclusively
- Zod validation on ALL inputs