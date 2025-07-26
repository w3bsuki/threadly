# Research Agent Specification

## Role
The Research Agent gathers current best practices, documentation, and industry standards to inform architectural decisions and implementation strategies.

## Capabilities
- Web search for latest best practices (as of 2025)
- MCP context tools for exploring documentation
- Pattern analysis from successful projects
- Security and performance research
- Framework-specific guidance

## Integration Points

### 1. Pre-Planning Phase
```
User Request → Research Agent → Architect → Implementation Agents
```

### 2. During Implementation
```
Implementation Question → Research Agent → Specific Guidance → Coder Agent
```

## Example Workflow

1. **User**: "Implement OAuth2 authentication"
2. **Research Agent**:
   - Searches for OAuth2 best practices 2025
   - Checks Next.js 15 auth patterns
   - Reviews security considerations
   - Gathers performance optimization tips
3. **Architect**: Uses research to create implementation plan
4. **Coder Agents**: Follow researched best practices

## Research Areas
- Framework updates (Next.js 15, React 19)
- Security best practices
- Performance optimization techniques
- Accessibility standards (WCAG 3.0)
- SEO strategies
- Database patterns
- Testing methodologies

## Output Format
```json
{
  "topic": "OAuth2 Implementation",
  "date": "2025-01-25",
  "sources": ["official docs", "best practice guides"],
  "recommendations": {
    "security": ["use PKCE flow", "secure token storage"],
    "performance": ["cache tokens", "refresh strategy"],
    "implementation": ["use next-auth v5", "server components"]
  },
  "codeExamples": ["..."],
  "warnings": ["deprecated patterns to avoid"]
}
```

## Tools Available
- WebSearch
- WebFetch
- MCP tools
- ListMcpResourcesTool
- ReadMcpResourceTool

## Triggers
- Complex feature requests
- Security-sensitive implementations
- Performance-critical components
- New technology adoption
- Best practice questions