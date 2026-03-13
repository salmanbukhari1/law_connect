import { OpenAIProvider } from './openai';
import { MockProvider } from './mock';
import type { LLMProvider } from './types';

/**
 * Factory function that reads LLM_PROVIDER from env and returns
 * the appropriate provider instance.
 *
 * To add a new provider (e.g. Anthropic):
 *   1. Create src/lib/llm/anthropic.ts implementing LLMProvider
 *   2. Add a case here
 *   3. Zero changes required anywhere else (OCP)
 */
export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER ?? 'openai';

  switch (provider) {
    case 'mock':
      return new MockProvider();

    case 'openai':
    default: {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          'OPENAI_API_KEY is not set. Set it in .env.local or set LLM_PROVIDER=mock to use the mock provider.'
        );
      }
      const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
      return new OpenAIProvider(apiKey, model);
    }
  }
}

export type { LLMProvider };
export { ContentItemOutputSchema, LLMResponseSchema } from './types';
export type { ContentItemOutput, LLMResponse } from './types';
