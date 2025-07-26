# Example Orchestrated Workflow

## Scenario: Add User Authentication Across the Monorepo

### Step 1: Orchestrator Audit
```
You: "We need to add user authentication to the platform by tomorrow"
Orchestrator: "I'll audit the current state and plan the implementation"
```

**Orchestrator Actions**:
- Audits existing auth patterns
- Identifies affected packages
- Creates high-level plan

### Step 2: Architect Task Breakdown
```
Orchestrator → turborepo-architect: 
{
  "taskId": "auth-implementation",
  "type": "implement",
  "description": "Add complete authentication system",
  "scope": ["apps/web", "apps/app", "apps/api", "packages/database"]
}
```

**Architect Output**:
```json
{
  "tasks": [
    {
      "taskId": "auth-db-schema",
      "agent": "prisma-database-engineer",
      "description": "Create User, Session, and Auth models",
      "scope": ["packages/database/prisma/schema.prisma"]
    },
    {
      "taskId": "auth-api-endpoints",
      "agent": "api-engineer",
      "dependencies": ["auth-db-schema"],
      "description": "Implement login, logout, register endpoints",
      "scope": ["apps/api/app/api/auth/*"]
    },
    {
      "taskId": "auth-web-ui",
      "agent": "web-app-engineer",
      "description": "Create login/register pages",
      "scope": ["apps/web/app/[locale]/(auth)/*"]
    },
    {
      "taskId": "auth-app-ui",
      "agent": "app-repo-engineer",
      "description": "Add auth flow to main app",
      "scope": ["apps/app/app/[locale]/(unauthenticated)/*"]
    },
    {
      "taskId": "auth-styling",
      "agent": "ui-ux-styling-expert",
      "description": "Style auth components consistently",
      "scope": ["all auth components"]
    }
  ]
}
```

### Step 3: Parallel Implementation

**Database Schema** (prisma-database-engineer):
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  sessions  Session[]
  createdAt DateTime  @default(now())
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
}
```

**API Endpoints** (api-engineer):
```typescript
// apps/api/app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = loginSchema.parse(await request.json())
  // Implementation with proper validation
}
```

**Web UI** (web-app-engineer) + **Styling** (ui-ux-styling-expert):
- Working simultaneously
- Web engineer creates components
- UI expert applies consistent styling

### Step 4: Validation Pipeline

**techstack-validator** checks:
- ✓ All imports use @repo/*
- ✓ No 'any' types
- ✓ Zod validation on all inputs
- ✓ Proper error handling

**next-forge-auditor** reviews:
- ✓ Server vs Client components
- ✓ Security best practices
- ✓ Performance optimizations
- ✓ Accessibility compliance

### Step 5: Testing

**test-runner** executes:
```bash
pnpm typecheck  # Must pass
pnpm test       # Run auth tests
pnpm test:e2e   # End-to-end auth flow
```

### Step 6: Completion

**Orchestrator** confirms:
- All tasks completed
- Tests passing
- Ready for deployment

## Key Benefits

1. **Parallel Execution**: Web, app, and API work simultaneously
2. **Domain Expertise**: Each agent focuses on their specialty
3. **Quality Gates**: Validation → Review → Testing pipeline
4. **Clear Handoffs**: Structured task format ensures nothing missed
5. **Rapid Delivery**: Production-ready in hours, not days

## Common Patterns

### Cross-Package Feature
```
Orchestrator → Architect → [Multiple Implementation Agents] → Validation → Testing
```

### Bug Fix
```
Orchestrator → Domain Agent → Code Reviewer → Test Runner
```

### Performance Optimization
```
Orchestrator → next-forge-auditor → Implementation Agent → Test Runner
```

### Database Migration
```
Orchestrator → prisma-database-engineer → API Engineers → Test Runner
```