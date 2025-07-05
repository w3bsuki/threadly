# 🤖 Autonomous Agent Setup Guide

## 🚀 Quick Launch (Recommended)

### 1. Start the Orchestrator
```bash
# Build and start the orchestrator
cd packages/claude-orchestrator
pnpm build
pnpm dev
```

### 2. In Claude Code, run the autonomous workflow:
```
start_workflow goal="Build production-ready Threadly marketplace following PROJECT.md vision"
```

This will automatically:
- ✅ Research the codebase 
- ✅ Create implementation plan
- ✅ Spawn specialized agents
- ✅ Execute tasks in parallel worktrees
- ✅ Self-improve and coordinate

## 🎯 Manual Agent Setup (Advanced)

If you want to spawn specific agents manually:

### 1. Create Worktrees for Parallel Development
```bash
# Research worktree (global analysis)
git_worktree branch="research/global-analysis" path="../threadly-research"

# Implementation worktree (feature development) 
git_worktree branch="feature/marketplace-core" path="../threadly-impl"

# Testing worktree (quality assurance)
git_worktree branch="test/comprehensive-coverage" path="../threadly-test"
```

### 2. Spawn Specialized Agents
```bash
# Global researcher - analyzes entire codebase
spawn_agent role="researcher" workdir="../threadly-research" 

# Implementation specialist - builds features
spawn_agent role="implementer" workdir="../threadly-impl" specialization="react"

# Quality reviewer - ensures standards
spawn_agent role="reviewer" workdir="../threadly-test" specialization="testing"

# API specialist - backend services
spawn_agent role="specialist" workdir="../threadly-impl" specialization="api"
```

### 3. Assign Initial Tasks
```bash
# Research phase
assign_task agentId="researcher-xxxx" taskId="analyze-typescript-errors"
assign_task agentId="researcher-xxxx" taskId="audit-project-completeness"

# Implementation phase  
assign_task agentId="implementer-xxxx" taskId="complete-seller-onboarding"
assign_task agentId="implementer-xxxx" taskId="build-product-listing"

# Quality phase
assign_task agentId="reviewer-xxxx" taskId="write-comprehensive-tests"
assign_task agentId="reviewer-xxxx" taskId="security-audit"
```

## 📊 Monitor Agent Progress

### Check Agent Status
```bash
agent_status  # All agents
agent_status agentId="researcher-xxxx"  # Specific agent
```

### View Workflow Progress
```bash
workflow_status
get_session_summary
```

### Agent Communication
```bash
coordinate_agents from="orchestrator" to="all" message="Focus on PROJECT.md goals" type="coordination"
```

## 🎯 Self-Improvement Commands

### Performance Analysis
```bash
analyze_orchestrator_performance
improve_learning_system focus="all"
```

### Discover New Tools
```bash
discover_mcp_servers focus="productivity"
optimize_mcp_config addRecommended=true
```

### Custom Automation
```bash
create_custom_tool pattern="Fix TypeScript errors automatically" toolName="auto_fix_types"
```

## 🔄 Continuous Improvement Cycle

The agents will automatically:

1. **📊 Research Phase**
   - Analyze entire codebase for issues
   - Compare current state vs PROJECT.md vision
   - Identify gaps and prioritize work
   - Create detailed task breakdown

2. **⚡ Implementation Phase** 
   - Fix TypeScript errors and code quality
   - Build missing marketplace features
   - Optimize performance and security
   - Write comprehensive tests

3. **🔍 Review Phase**
   - Quality assurance and testing
   - Security and performance validation
   - Code review and standards compliance
   - Documentation and knowledge sharing

4. **🚀 Deploy Phase**
   - Integration testing
   - Production readiness checks
   - Performance monitoring
   - User acceptance validation

## 📈 Success Tracking

### Automated Metrics
- TypeScript error count (target: 0)
- Test coverage percentage (target: 90%+)
- Performance scores (Core Web Vitals)
- Security vulnerability count (target: 0)

### Business Metrics
- Feature completion rate vs PROJECT.md
- User flow functionality (seller → buyer)
- Payment processing reliability
- Mobile responsiveness score

## 🛑 Emergency Controls

### Pause All Work
```bash
emergency_stop
```

### Resume Work
```bash
start_workflow resume=true
```

### Get Help
```bash
workflow_learnings  # Learn from past sessions
get_session_summary # Current state overview
```

## 🎯 The Vision

Your agents are working towards building **the next Vinted competitor**. They understand:

- ✅ **Business Goal**: C2C fashion marketplace with 5% commission
- ✅ **Technical Goal**: Production-ready, secure, fast, mobile-optimized
- ✅ **User Goal**: Seamless seller onboarding → buyer discovery → purchase → payment
- ✅ **Quality Goal**: Zero errors, 90%+ test coverage, excellent UX

**The agents will work autonomously, coordinate with each other, and continuously improve until the vision in PROJECT.md is achieved.**

🚀 **Ready to launch? Run `start_workflow` and watch your autonomous team build Threadly!**