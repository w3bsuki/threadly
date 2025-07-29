import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { aiEnv } from './keys';
import type { AIMessage, AIOptions, AIResponse } from './types';

const anthropic = new Anthropic({
  apiKey: aiEnv.ANTHROPIC_API_KEY,
});

export async function generateAnthropic(
  messages: AIMessage[],
  options?: AIOptions
): Promise<AIResponse> {
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const response = await anthropic.messages.create({
    model: options?.model || 'claude-3-haiku-20240307',
    system: systemMessage?.content,
    messages: userMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    max_tokens: options?.maxTokens || aiEnv.AI_MAX_TOKENS,
    temperature: options?.temperature || aiEnv.AI_TEMPERATURE,
  });

  return {
    content: response.content[0].type === 'text' ? response.content[0].text : '',
    model: response.model,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
  };
}

export async function streamAnthropic(
  messages: AIMessage[],
  options?: AIOptions
) {
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');

  const stream = await anthropic.messages.create({
    model: options?.model || 'claude-3-haiku-20240307',
    system: systemMessage?.content,
    messages: userMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    max_tokens: options?.maxTokens || aiEnv.AI_MAX_TOKENS,
    temperature: options?.temperature || aiEnv.AI_TEMPERATURE,
    stream: true,
  });

  return stream;
}