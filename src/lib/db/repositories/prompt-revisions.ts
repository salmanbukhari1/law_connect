import { eq, desc } from 'drizzle-orm';
import { db } from '../index';
import { promptRevisions, type NewPromptRevision, type PromptRevision } from '../schema';
import type { LLMExecutionMeta } from '@/lib/llm/types';

export async function createPromptRevision(
  data: Pick<NewPromptRevision, 'sessionId' | 'promptText' | 'version'>
): Promise<PromptRevision> {
  return db.insert(promptRevisions).values(data).returning().get();
}

// Writes LLM execution metadata back onto a revision after a successful call.
// Enables cost tracking, model comparisons, and performance monitoring.
export async function updateRevisionMeta(
  id: number,
  meta: LLMExecutionMeta
): Promise<void> {
  db.update(promptRevisions)
    .set({
      model: meta.model,
      tokenInput: meta.tokenInput,
      tokenOutput: meta.tokenOutput,
      executionTimeMs: meta.executionTimeMs,
    })
    .where(eq(promptRevisions.id, id))
    .run();
}

export async function getLatestRevision(sessionId: number): Promise<PromptRevision | undefined> {
  return db
    .select()
    .from(promptRevisions)
    .where(eq(promptRevisions.sessionId, sessionId))
    .orderBy(desc(promptRevisions.version))
    .get();
}

export async function listRevisions(sessionId: number): Promise<PromptRevision[]> {
  return db
    .select()
    .from(promptRevisions)
    .where(eq(promptRevisions.sessionId, sessionId))
    .orderBy(desc(promptRevisions.version))
    .all();
}
