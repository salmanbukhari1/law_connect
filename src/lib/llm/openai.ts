import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { LLMResponseSchema, type LLMProvider, type LLMResult } from './types';

const SYSTEM_PROMPT = `You are a helpful assistant that generates structured, insightful content in response to user prompts.

Your response must be a JSON object with an "items" array. Each item should have:
- title: A concise, descriptive heading (max 10 words)  
- body: A detailed, useful explanation (2-5 sentences)
- category: An optional label like "tip", "idea", "warning", "example", "step", etc.

Generate between 3 and 10 items. Be specific, practical, and relevant to the user's prompt.`;

export class OpenAIProvider implements LLMProvider {
  private model: string;

  constructor(_apiKey: string, model = 'gpt-4o-mini') {
    // API key is read from OPENAI_API_KEY env var by the AI SDK automatically
    this.model = model;
  }

  async execute(prompt: string): Promise<LLMResult> {
    const startTime = Date.now();

    const result = await generateObject({
      model: openai(this.model),
      schema: LLMResponseSchema,
      system: SYSTEM_PROMPT,
      prompt,
    });

    return {
      items: result.object.items,
      meta: {
        model: this.model,
        tokenInput: result.usage?.inputTokens ?? null,
        tokenOutput: result.usage?.outputTokens ?? null,
        executionTimeMs: Date.now() - startTime,
      },
    };
  }
}
