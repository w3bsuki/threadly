import 'server-only';
import OpenAI from 'openai';
import { aiEnv } from './keys';
import type { AIMessage, AIOptions, AIResponse } from './types';

const openai = new OpenAI({
  apiKey: aiEnv.OPENAI_API_KEY,
});

export async function generateOpenAI(
  messages: AIMessage[],
  options?: AIOptions
): Promise<AIResponse> {
  const completion = await openai.chat.completions.create({
    model: options?.model || aiEnv.AI_MODEL,
    messages,
    temperature: options?.temperature || aiEnv.AI_TEMPERATURE,
    max_tokens: options?.maxTokens || aiEnv.AI_MAX_TOKENS,
    stream: false,
  });

  const choice = completion.choices[0];
  if (!choice) {
    throw new Error('No completion choice returned');
  }
  
  const usage = completion.usage!;

  return {
    content: choice.message.content || '',
    model: completion.model,
    usage: {
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    },
  };
}

export async function streamOpenAI(
  messages: AIMessage[],
  options?: AIOptions
) {
  const stream = await openai.chat.completions.create({
    model: options?.model || aiEnv.AI_MODEL,
    messages,
    temperature: options?.temperature || aiEnv.AI_TEMPERATURE,
    max_tokens: options?.maxTokens || aiEnv.AI_MAX_TOKENS,
    stream: true,
  });

  return stream;
}