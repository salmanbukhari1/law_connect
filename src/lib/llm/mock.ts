import { type LLMProvider, type LLMResult } from './types';

/**
 * Mock LLM provider — returns deterministic data.
 * Set LLM_PROVIDER=mock in .env.local to use this without an API key.
 * Demonstrates OCP: adding this provider required zero changes to routes or repos.
 */
export class MockProvider implements LLMProvider {
  async execute(prompt: string): Promise<LLMResult> {
    const startTime = Date.now();
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 800));

    return {
      items: [
        {
          title: 'Mock Item 1',
          body: `This is a mock response for your prompt: "${prompt.slice(0, 60)}...". No API key required.`,
          category: 'example',
        },
        {
          title: 'Mock Item 2',
          body: 'This demonstrates the OCP principle — a new provider was added without touching any existing route or repository code.',
          category: 'tip',
        },
        {
          title: 'Mock Item 3',
          body: 'Set LLM_PROVIDER=openai and OPENAI_API_KEY=your-key in .env.local to use the real OpenAI provider.',
          category: 'info',
        },
      ],
      meta: {
        model: 'mock',
        tokenInput: null,
        tokenOutput: null,
        executionTimeMs: Date.now() - startTime,
      },
    };
  }
}
