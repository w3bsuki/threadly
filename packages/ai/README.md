# @repo/ai

AI integration package for Threadly's C2C fashion marketplace. This package provides OpenAI-powered functionality for enhanced user experience, including intelligent product descriptions, search improvements, and customer support automation.

## Overview

The AI package integrates OpenAI's powerful language models into Threadly:

- **OpenAI Integration**: Seamless integration with OpenAI's GPT models
- **Chat Interface**: Pre-built chat components for AI conversations
- **Text Generation**: Generate product descriptions, tags, and content
- **Embeddings**: Create vector embeddings for semantic search
- **React Components**: Ready-to-use UI components for AI features
- **Type Safety**: Full TypeScript support with proper typing

## Installation

```bash
pnpm add @repo/ai
```

## Setup & Configuration

### Environment Variables

Create a `.env.local` file in your app directory:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### API Key Configuration

The package uses `@t3-oss/env-nextjs` for environment variable validation:

```typescript
// The package automatically validates the API key
import { keys } from '@repo/ai/keys';

const { OPENAI_API_KEY } = keys();
```

## Dependencies

This package depends on:
- `@ai-sdk/openai` - OpenAI SDK for AI models
- `@t3-oss/env-nextjs` - Environment variable validation
- `ai` - Vercel AI SDK for React integration
- `react` - React framework
- `react-markdown` - Markdown rendering for AI responses
- `tailwind-merge` - Utility for merging Tailwind classes
- `zod` - Schema validation

## API Reference

### Models

```typescript
import { models } from '@repo/ai';

// Available models
const chatModel = models.chat;        // gpt-4o-mini for chat
const embeddingModel = models.embeddings; // text-embedding-3-small for embeddings
```

### React Hooks and Components

```typescript
import { 
  useChat, 
  useCompletion, 
  useAssistant 
} from '@repo/ai';

// Chat functionality
const { messages, input, handleInputChange, handleSubmit } = useChat();

// Text completion
const { completion, complete, isLoading } = useCompletion();

// Assistant integration
const { 
  status, 
  messages, 
  input, 
  submitMessage, 
  handleInputChange 
} = useAssistant({ api: '/api/assistant' });
```

### Pre-built Components

```typescript
import { Message, Thread } from '@repo/ai';

// Message component for displaying chat messages
<Message 
  data={message} 
  markdown={{ 
    // Custom markdown props
    components: {
      // Custom component overrides
    }
  }} 
/>

// Thread component for chat container
<Thread className="custom-thread-styles">
  {messages.map((message) => (
    <Message key={message.id} data={message} />
  ))}
</Thread>
```

## Usage Examples

### Basic Chat Interface

```typescript
import { useChat } from '@repo/ai';
import { Message, Thread } from '@repo/ai';

function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! I can help you with product questions, sizing, and recommendations. What would you like to know?'
      }
    ]
  });

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <Thread>
        {messages.map((message) => (
          <Message key={message.id} data={message} />
        ))}
        {isLoading && (
          <div className="self-start bg-muted rounded-xl px-4 py-2">
            <div className="animate-pulse">Thinking...</div>
          </div>
        )}
      </Thread>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about this product..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Product Description Generator

```typescript
import { useCompletion } from '@repo/ai';

function ProductDescriptionGenerator({ productData }: { productData: any }) {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate-description',
  });

  const generateDescription = async () => {
    await complete(`Generate a compelling product description for this fashion item:
    
    Title: ${productData.title}
    Brand: ${productData.brand}
    Category: ${productData.category}
    Color: ${productData.color}
    Size: ${productData.size}
    Condition: ${productData.condition}
    Price: $${productData.price}
    
    Make it engaging and highlight key features that fashion buyers care about.`);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateDescription}
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate AI Description'}
      </button>
      
      {completion && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Generated Description:</h3>
          <p className="text-gray-700">{completion}</p>
        </div>
      )}
    </div>
  );
}
```

### API Route Examples

#### Chat API Route

```typescript
// app/api/chat/route.ts
import { models } from '@repo/ai';
import { streamText } from 'ai';
import { auth } from '@repo/auth/server';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();

  const result = await streamText({
    model: models.chat,
    messages,
    system: `You are a helpful assistant for a fashion marketplace. 
    Help users with product questions, sizing advice, and style recommendations.
    Be friendly, knowledgeable, and concise.`,
    maxTokens: 512,
  });

  return result.toAIStreamResponse();
}
```

#### Product Description API Route

```typescript
// app/api/generate-description/route.ts
import { models } from '@repo/ai';
import { generateText } from 'ai';
import { auth } from '@repo/auth/server';

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { prompt } = await req.json();

  try {
    const { text } = await generateText({
      model: models.chat,
      prompt,
      maxTokens: 256,
      temperature: 0.7,
    });

    return Response.json({ description: text });
  } catch (error) {
    console.error('AI generation error:', error);
    return new Response('AI generation failed', { status: 500 });
  }
}
```

### Advanced Features

#### Semantic Search with Embeddings

```typescript
import { models } from '@repo/ai';
import { embed } from 'ai';

async function generateEmbeddings(text: string) {
  const { embedding } = await embed({
    model: models.embeddings,
    value: text,
  });
  
  return embedding;
}

// Generate embeddings for product search
async function indexProduct(product: any) {
  const searchText = `${product.title} ${product.description} ${product.brand} ${product.category}`;
  const embedding = await generateEmbeddings(searchText);
  
  // Store embedding in database for similarity search
  await database.product.update({
    where: { id: product.id },
    data: { embedding: embedding }
  });
}
```

#### Smart Product Recommendations

```typescript
import { useCompletion } from '@repo/ai';

function ProductRecommendations({ userId, viewedProducts }: any) {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/recommendations',
  });

  const getRecommendations = async () => {
    const context = `User recently viewed: ${viewedProducts.map(p => p.title).join(', ')}`;
    await complete(context);
  };

  return (
    <div>
      <button onClick={getRecommendations} disabled={isLoading}>
        Get AI Recommendations
      </button>
      {completion && (
        <div className="recommendations">
          {completion}
        </div>
      )}
    </div>
  );
}
```

## Model Configuration

### Chat Model Settings

```typescript
import { models } from '@repo/ai';
import { generateText } from 'ai';

const result = await generateText({
  model: models.chat,
  prompt: 'Your prompt here',
  maxTokens: 256,
  temperature: 0.7,      // Controls randomness (0-1)
  topP: 0.9,            // Nucleus sampling
  frequencyPenalty: 0.1, // Reduce repetition
  presencePenalty: 0.1,  // Encourage topic diversity
});
```

### Embedding Model Usage

```typescript
import { models } from '@repo/ai';
import { embed, embedMany } from 'ai';

// Single embedding
const { embedding } = await embed({
  model: models.embeddings,
  value: 'Product description text',
});

// Multiple embeddings
const { embeddings } = await embedMany({
  model: models.embeddings,
  values: [
    'First product description',
    'Second product description',
    'Third product description'
  ],
});
```

## Error Handling

```typescript
import { useChat } from '@repo/ai';

function ChatWithErrorHandling() {
  const { messages, input, handleInputChange, handleSubmit, error, isLoading } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error);
      // Handle error (show toast, fallback, etc.)
    }
  });

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error.message}
        </div>
      )}
      {/* Rest of chat interface */}
    </div>
  );
}
```

## Best Practices

1. **Rate Limiting**: Implement rate limiting for AI API calls
2. **Caching**: Cache AI responses to reduce API usage
3. **Fallbacks**: Provide fallback content when AI fails
4. **User Feedback**: Allow users to rate AI responses
5. **Privacy**: Don't send sensitive user data to AI models
6. **Cost Management**: Monitor API usage and costs

## Security Considerations

- API keys are validated and secured using environment variables
- User authentication is required for AI features
- Input sanitization prevents prompt injection
- Rate limiting prevents abuse
- Sensitive data is filtered before sending to AI models

## Testing

```bash
# Run AI package tests
pnpm test packages/ai

# Test specific components
pnpm test packages/ai/components
```

## Integration Notes

This package integrates with:
- OpenAI API for language models
- Vercel AI SDK for React integration
- Next.js API routes for backend processing
- Authentication system for security

## Version History

- `0.0.0` - Initial release with OpenAI integration
- Core AI functionality
- Chat components
- TypeScript support
- React hooks integration