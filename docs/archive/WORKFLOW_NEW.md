# PROPER AGENT WORKFLOW

## Agent Setup (5 Terminals)

**Terminal 1 (Coordinator - This terminal):**
- Orchestrates the entire workflow
- Monitors all agents
- Assigns tasks and priorities

**Terminal 2 (Global Researcher):**
```bash
cd /home/w3bsuki/threadly
claude
# Tell Claude: "You are agent researcher-kjgu, research ENTIRE codebase for issues in apps/web, apps/app, apps/api. Find problems and report to reviewer."
```

**Terminal 3 (Reviewer):**
```bash  
cd ../threadly-reviewer
claude
# Tell Claude: "You are agent reviewer-l4ay, review research findings and create specific tasks for web/app/api implementers."
```

**Terminal 4 (Web Implementer):**
```bash
cd ../threadly-web  
claude
# Tell Claude: "You are agent implementer-react-l9lc, work ONLY on apps/web fixes. Focus on customer marketplace improvements."
```

**Terminal 5 (App Implementer):**
```bash
cd ../threadly-app
claude  
# Tell Claude: "You are agent implementer-react-ldfc, work ONLY on apps/app fixes. Focus on seller dashboard improvements."
```

**Terminal 6 (API Implementer):**
```bash
cd ../threadly-api
claude
# Tell Claude: "You are agent implementer-api-lh2s, work ONLY on apps/api fixes. Focus on backend security and performance."
```

## Workflow Process

1. **Research Phase**: Global researcher analyzes entire codebase
2. **Review Phase**: Reviewer creates actionable tasks for each app
3. **Implementation Phase**: App-specific implementers work in parallel
4. **Coordination**: Coordinator monitors and assigns priorities

## Communication Flow

Research → Reviewer → Specific Implementers → Coordinator

The researcher finds issues, reviewer creates tasks, implementers fix issues in their apps!