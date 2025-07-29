# Agent Orchestration Templates

Use these templates when spawning agents with the Task tool to ensure consistent, effective parallel work.

## 🎯 Web App Agent Template

```
You are working on the Threadly customer marketplace (apps/web).

CONTEXT:
- Read PROJECT_CONTEXT.md section "Web App (Customer Marketplace)"
- Current sprint goals are in "30-Day Launch Plan Status"
- Follow all patterns in .claude/CLAUDE.md strictly

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

WORKING DIRECTORY: /apps/web

SUCCESS CRITERIA:
- All TypeScript errors resolved
- No console.log statements
- Mobile responsive implementation
- Performance metrics improved

UPDATE WHEN COMPLETE:
Update PROJECT_CONTEXT.md in "Active Development Areas > Web App" section with:
- Features completed
- Issues discovered
- Performance metrics
- Next recommended actions
```

## 🛠️ Dashboard Agent Template

```
You are working on the Threadly seller dashboard (apps/app).

CRITICAL CONTEXT:
- Missing safeDecimalToNumber function causing crashes
- Read PROJECT_CONTEXT.md section "Active Development Areas > Seller Dashboard"
- Security vulnerabilities need immediate attention

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

WORKING DIRECTORY: /apps/app

SUCCESS CRITERIA:
- Dashboard functional without crashes
- Seller onboarding flow complete
- Analytics showing real data (no mocks)
- All security issues addressed

UPDATE WHEN COMPLETE:
Update PROJECT_CONTEXT.md in "Active Development Areas > Seller Dashboard" with progress and any blockers found.
```

## 🔒 API Agent Template

```
You are working on the Threadly API services (apps/api).

SECURITY CRITICAL:
- Database credentials exposed in start-dev.sh
- Stripe webhooks lack signature verification
- No rate limiting on 56% of endpoints
- Read PROJECT_CONTEXT.md "Critical Issues Blocking Launch > Security"

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

WORKING DIRECTORY: /apps/api

SUCCESS CRITERIA:
- All security vulnerabilities patched
- Rate limiting implemented
- Webhook verification active
- Comprehensive error handling
- Audit logging in place

UPDATE WHEN COMPLETE:
Update PROJECT_CONTEXT.md security status and mark completed items in "Next Actions Queue".
```

## 📦 Package Enhancement Agent Template

```
You are enhancing the [PACKAGE_NAME] package in Threadly.

CONTEXT:
- Read PROJECT_CONTEXT.md for overall architecture
- Package must follow Next-Forge patterns
- Exports must be properly configured
- No circular dependencies allowed

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

WORKING DIRECTORY: /packages/[PACKAGE_NAME]

SUCCESS CRITERIA:
- Package.json exports configured correctly
- TypeScript types exported
- Comprehensive tests added
- Documentation updated
- No breaking changes to consumers

UPDATE WHEN COMPLETE:
Update package README.md and notify in PROJECT_CONTEXT.md if any breaking changes or new patterns discovered.
```

## 🧪 Testing Agent Template

```
You are implementing comprehensive testing for Threadly.

CURRENT STATE:
- Test coverage: <10%
- Target coverage: 90% for critical paths
- Testing framework: [Vitest/Jest]

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

FOCUS AREAS:
- Payment processing flows
- User authentication
- Order management
- API endpoints
- Critical UI components

SUCCESS CRITERIA:
- 90% coverage on assigned areas
- All edge cases covered
- Integration tests for workflows
- Performance benchmarks included

UPDATE WHEN COMPLETE:
Update PROJECT_CONTEXT.md with new coverage metrics and any bugs discovered during testing.
```

## 🚀 Performance Agent Template

```
You are optimizing Threadly's performance.

CURRENT METRICS:
- Page Load: 4.5s (target <2s)
- Bundle Size: >50MB
- API Response: 350ms (target <200ms)
- Read PROJECT_CONTEXT.md "Business Metrics & Goals"

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

OPTIMIZATION TARGETS:
- Code splitting implementation
- Image optimization
- Caching strategies
- Database query optimization
- Bundle size reduction

SUCCESS CRITERIA:
- Core Web Vitals: Good
- Bundle size <50MB
- API responses <200ms
- Lighthouse score >90

UPDATE WHEN COMPLETE:
Update performance metrics in PROJECT_CONTEXT.md with before/after comparisons.
```

## 📱 Mobile Optimization Agent Template

```
You are ensuring Threadly works perfectly on mobile devices.

CONTEXT:
- Mobile-first marketplace
- Current state: Not optimized
- Target: Excellent mobile UX

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

FOCUS AREAS:
- Responsive layouts
- Touch interactions
- Performance on low-end devices
- Offline capabilities
- App-like experience

SUCCESS CRITERIA:
- Works on all screen sizes
- Touch targets meet guidelines
- Smooth scrolling/animations
- Fast load on 3G
- PWA capabilities added

UPDATE WHEN COMPLETE:
Document mobile improvements in PROJECT_CONTEXT.md and note any remaining issues.
```

## 🔍 Code Quality Agent Template

```
You are improving code quality across Threadly.

CURRENT ISSUES:
- TypeScript any types prevalent
- Console.log in production
- Duplicate code (500+ lines)
- Mock data in production

YOUR TASKS:
[SPECIFIC_TASKS_HERE]

QUALITY TARGETS:
- Zero any types
- No console.log statements
- DRY principle enforcement
- Proper error boundaries
- Consistent code style

SUCCESS CRITERIA:
- TypeScript strict mode passing
- ESLint rules satisfied
- No code duplication
- Proper abstractions created

UPDATE WHEN COMPLETE:
Update code quality metrics in PROJECT_CONTEXT.md.
```

## 🔄 Documentation Maintenance Agent Template

```
You are maintaining Threadly's documentation.

PRIMARY RESPONSIBILITY:
- Keep PROJECT_CONTEXT.md current
- Archive outdated docs
- Ensure accuracy

YOUR TASKS:
- Monitor all agent updates
- Consolidate progress reports
- Update metrics and status
- Identify documentation gaps
- Archive completed items

CONTINUOUS ACTIONS:
- Every 2 hours: Check for updates
- End of day: Consolidate progress
- Weekly: Archive completed items
- As needed: Clarify ambiguities

SUCCESS CRITERIA:
- PROJECT_CONTEXT.md always current
- No conflicting information
- Clear action items
- Accurate metrics

DO NOT:
- Delete historical information
- Make subjective changes
- Alter completed work records
```

## 📋 Usage Instructions

1. **Select appropriate template** based on task area
2. **Fill in [SPECIFIC_TASKS_HERE]** with clear, measurable goals
3. **Set time expectations** if applicable
4. **Launch agents in parallel** for non-conflicting work
5. **Monitor updates** to PROJECT_CONTEXT.md

### Example Usage:

```
Task tool usage:
- Description: "Fix seller dashboard crashes"
- Prompt: [Dashboard Agent Template with specific tasks filled in]
```

### Coordination Tips:

- Launch complementary agents (e.g., API + Testing)
- Avoid conflicting work areas
- Stagger documentation updates
- Review agent work before merging

Remember: Agents should always update PROJECT_CONTEXT.md upon completion!