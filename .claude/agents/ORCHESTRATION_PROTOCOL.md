# Agent Orchestration Protocol v2.0

## Enhanced Task Format
All inter-agent tasks use this enriched structure:
```json
{
  "taskId": "unique-identifier",
  "type": "research|audit|implement|review|test",
  "scope": ["files or directories"],
  "description": "Clear task description",
  "dependencies": ["taskId-1", "taskId-2"],
  "context": {
    "patterns": ["pattern-name-from-context-md"],
    "relatedImplementations": ["path/to/similar"],
    "crossDomainImpacts": ["apps/web", "apps/app"],
    "performance": { "target": "mobile-first", "metrics": ["LCP < 2.5s"] }
  },
  "constraints": {
    "mustPass": ["typecheck", "tests"],
    "incrementalValidation": true
  }
}
```

## Streamlined Agent Roster

### Core Agents
- **orchestrator**: Main coordinator (YOU)
- **researcher**: Gathers patterns & best practices (NEW)
- **architect**: Task breakdown specialist
- **coder-web**: apps/web implementation
- **coder-app**: apps/app implementation
- **coder-api**: apps/api implementation
- **validator**: Real-time validation
- **reviewer**: Quality assurance
- **tester**: Test execution
- **context**: Documentation updates

### Specialist Agents (as-needed)
- **ui-ux-styling-expert**: Complex UI/animations
- **prisma-database-engineer**: Schema/migrations
- **next-forge-auditor**: Next.js audits

## Optimized Execution Flow

### Phase 1: Research & Planning (PARALLEL)
```
User Request
    ↓
[researcher + architect] (parallel execution)
    ↓
Enriched task breakdown with context
```

### Phase 2: Implementation (PARALLEL)
```
Task assignments
    ↓
[coder-web + coder-app + coder-api + validator] (parallel)
    ↓
Incremental validation after each file change
```

### Phase 3: Quality & Completion
```
Implementation complete
    ↓
[reviewer + tester] (parallel if possible)
    ↓
context agent updates documentation
```

## Key Improvements

### 1. Research-First Approach
- researcher runs BEFORE implementation
- Provides patterns, best practices, warnings
- Prevents rework and ensures quality

### 2. Incremental Validation
- Run `pnpm typecheck` after EACH file change
- validator runs alongside coders, not after
- Catch errors immediately

### 3. Rich Context Passing
- Include CONTEXT.md patterns in every task
- Reference similar implementations
- Flag cross-domain impacts

### 4. True Parallelization
**CRITICAL**: Launch agents in a SINGLE message:
```
// CORRECT - True parallel execution
<function_calls>
<invoke name="Task" subagent_type="researcher">...</invoke>
<invoke name="Task" subagent_type="coder-web">...</invoke>
<invoke name="Task" subagent_type="coder-app">...</invoke>
</function_calls>

// WRONG - Sequential execution
<invoke name="Task" subagent_type="researcher">...</invoke>
// wait for response
<invoke name="Task" subagent_type="coder-web">...</invoke>
```

## Communication Rules

### Real-Time Status
- Update todos immediately when status changes
- Include blockers and warnings
- Share findings proactively

### Context References
- Every task MUST check CONTEXT.md
- Reference pattern names in implementations
- Update CONTEXT.md after major features

### Cross-Domain Coordination
- Flag when changes affect multiple apps
- Share components via packages
- Coordinate API contracts

## Success Criteria
Tasks complete when:
- All implementation complete
- `pnpm typecheck` passes (checked incrementally)
- Validation approved
- Tests passing
- Documentation updated
- No unresolved cross-domain conflicts

## Performance Targets
- Research phase: < 2 minutes
- Implementation: Incremental progress
- Validation: Real-time (no batch)
- Total feature time: 50% faster via parallelization