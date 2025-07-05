# CONTINUOUS WORKFLOW SYSTEM

## Agent Autonomous Operation Rules

### RESEARCHER AGENT (researcher-5a0z)
**Current Focus:** Performance bottlenecks analysis
**Next Tasks Queue:**
1. Web app performance analysis
2. API performance analysis  
3. Database query optimization research
4. Bundle size analysis
5. Memory leak detection
6. Third-party dependency audit

**Autonomous Loop:**
- Always have a task in progress
- When current task completes, automatically move to next in queue
- Document findings in real-time
- Report critical issues immediately to coordinator

### IMPLEMENTER AGENT (implementer-ylr0)
**Current Focus:** TypeScript error fixes
**Next Tasks Queue:**
1. Fix all TypeScript 'any' types
2. Remove console.log statements
3. Implement performance optimizations from researcher findings
4. Add missing error handling
5. Optimize database queries
6. Bundle optimization

**Autonomous Loop:**
- Fix issues as they're discovered
- Implement improvements from research findings
- Run tests after each change
- Commit working changes immediately

### REVIEWER AGENT (reviewer-yuhl)
**Current Focus:** Security audit review
**Next Tasks Queue:**
1. Review all security vulnerabilities
2. Code quality audit
3. Test coverage analysis
4. Review implementer's changes
5. Performance review
6. Architecture review

**Autonomous Loop:**
- Review all code changes in real-time
- Validate security best practices
- Ensure quality standards
- Block poor implementations

## COORDINATION PROTOCOL

### Agent Communication
- Check `AGENT_COMM.md` every 5 minutes
- Report progress to coordinator hourly
- Escalate blockers immediately
- Share findings with relevant agents

### Task Handoffs
- Researcher → Implementer: Performance findings
- Implementer → Reviewer: Code changes
- Reviewer → Coordinator: Quality reports
- Coordinator → All: Priority changes

### Quality Gates
- No commits without reviewer approval
- All TypeScript errors must be fixed
- Security vulnerabilities block deployment
- Performance regressions require investigation

## CONTINUOUS IMPROVEMENT

### Metrics Tracking
- Code quality score
- Test coverage percentage
- Security vulnerability count
- Performance benchmarks
- Task completion rate

### Learning System
- Track common issues
- Improve estimation accuracy
- Optimize task prioritization
- Enhance agent coordination

## EMERGENCY PROTOCOLS

### If Agent Gets Stuck
1. Report to coordinator
2. Request task reassignment
3. Switch to lower priority task
4. Continue working on backlog

### If Critical Issue Found
1. Immediate escalation to coordinator
2. Block related work
3. Create high-priority fix task
4. Validate fix before proceeding

---

**Last Updated:** Session 3e1196bb
**Active Agents:** 3/3
**Mode:** CONTINUOUS_AUTONOMOUS