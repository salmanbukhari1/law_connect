import { z } from 'zod';

// Schema for a single structured content item returned by the LLM
export const ContentItemOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for this item'),
  body: z.string().describe('The detailed content or explanation for this item'),
  category: z.string().optional().describe('An optional category or tag (e.g. "tip", "warning", "idea")'),
});

export type ContentItemOutput = z.infer<typeof ContentItemOutputSchema>;

export const LLMResponseSchema = z.object({
  items: z.array(ContentItemOutputSchema).min(1).max(20),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// Execution metadata returned alongside generated items
export interface LLMExecutionMeta {
  model: string;
  tokenInput: number | null;
  tokenOutput: number | null;
  executionTimeMs: number;
}

export interface LLMResult {
  items: ContentItemOutput[];
  meta: LLMExecutionMeta;
}

// ─── Provider Interface (Strategy Pattern) ───────────────────────────────────
// Adding a new model provider = add a new file implementing this interface.
// Existing code (routes, repositories) never changes. Open/Closed Principle.
export interface LLMProvider {
  execute(prompt: string): Promise<LLMResult>;
}
