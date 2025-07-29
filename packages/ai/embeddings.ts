import 'server-only';
import OpenAI from 'openai';
import { aiEnv } from './keys';
import type { EmbeddingResponse } from './types';

const openai = new OpenAI({
  apiKey: aiEnv.OPENAI_API_KEY,
});

export async function createEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResponse> {
  const response = await openai.embeddings.create({
    model,
    input: text,
  });

  const firstData = response.data[0];
  if (!firstData) {
    throw new Error('No embedding data returned');
  }
  
  const embedding = firstData.embedding;

  return {
    embedding,
    model: response.model,
    dimensions: embedding.length,
  };
}

export async function createEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResponse[]> {
  const response = await openai.embeddings.create({
    model,
    input: texts,
  });

  return response.data.map((item) => ({
    embedding: item.embedding,
    model: response.model,
    dimensions: item.embedding.length,
  }));
}