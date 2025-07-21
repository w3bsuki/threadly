# Basehub MCP Configuration

## Overview

Threadly uses Basehub as its Content Management System (CMS) with Model Context Protocol (MCP) support for AI-powered content management.

## Configuration

### API Tokens

1. **CMS Token** (for content access):
   ```
   BASEHUB_TOKEN=bshb_pk_q37xe381wvnyrp2ewgmeyoidhozrwfans4vb1ei9kqj8q17ow4gd4tukafbv4s40
   ```

2. **MCP Token** (for AI integration):
   ```json
   {
     "url": "https://basehub.com/api/mcp",
     "headers": {
       "Authorization": "Bearer bshb_mcp_mqt0nO7j7USPMfXZd2ceJ27qH1dbJLNfTxw5rCyG2BWxVIVvxoSyVAVu2LMqvbEn"
     }
   }
   ```

## Usage

### CMS Integration

The Basehub CMS is integrated through the `@repo/cms` package:

```typescript
import { basehub } from '@repo/cms';

// Fetch content
const content = await basehub.query({
  // Your query here
});
```

### MCP Integration

The Model Context Protocol allows AI models to interact with your CMS content:

1. Configure your AI tool with the MCP endpoint
2. Use the provided bearer token for authentication
3. The AI can now read and manage CMS content

## Security

- Keep both tokens secure and never commit them to version control
- Use environment variables for production deployments
- Rotate tokens regularly
- Use read-only tokens where write access isn't needed

## Features

- **Type-safe content queries**: Full TypeScript support
- **AI-powered content management**: MCP integration for automated content operations
- **Real-time updates**: Content changes reflect immediately
- **Version control**: Track content changes over time
- **Multi-language support**: Manage content in multiple languages

## Best Practices

1. Always use environment variables for tokens
2. Implement proper error handling for CMS queries
3. Cache frequently accessed content
4. Use TypeScript for type-safe content access
5. Monitor API usage to stay within limits