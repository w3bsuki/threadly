# @repo/ai

AI integration utilities for OpenAI and Anthropic.

## Installation

This package is part of the monorepo and should be installed as a workspace dependency:

```json
{
  "dependencies": {
    "@repo/ai": "workspace:*"
  }
}
```

## Configuration

Set the following environment variables:

```env
# Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Model Configuration
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
```

## Usage

### OpenAI

```typescript
import { generateOpenAI, streamOpenAI } from '@repo/ai';

// Generate a response
const response = await generateOpenAI([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello!' }
]);

// Stream a response
const stream = await streamOpenAI([
  { role: 'user', content: 'Tell me a story' }
]);
```

### Anthropic

```typescript
import { generateAnthropic, streamAnthropic } from '@repo/ai';

// Generate a response
const response = await generateAnthropic([
  { role: 'system', content: 'You are Claude.' },
  { role: 'user', content: 'Hello!' }
]);
```

### Embeddings

```typescript
import { createEmbedding, createEmbeddings } from '@repo/ai';

// Single embedding
const embedding = await createEmbedding('Hello world');

// Multiple embeddings
const embeddings = await createEmbeddings([
  'First text',
  'Second text'
]);
```

## Exports

- `generateOpenAI` - Generate text with OpenAI
- `streamOpenAI` - Stream text with OpenAI
- `generateAnthropic` - Generate text with Anthropic
- `streamAnthropic` - Stream text with Anthropic
- `createEmbedding` - Create a single embedding
- `createEmbeddings` - Create multiple embeddings
- Types: `AIMessage`, `AIOptions`, `AIResponse`, `EmbeddingResponse`