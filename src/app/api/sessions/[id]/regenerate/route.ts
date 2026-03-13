import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLLMProvider } from '@/lib/llm';
import { getSession, updateSessionStatus } from '@/lib/db/repositories/sessions';
import { createPromptRevision, getLatestRevision, updateRevisionMeta } from '@/lib/db/repositories/prompt-revisions';
import {
  archiveItemsBySession,
  createContentItems,
} from '@/lib/db/repositories/content-items';

const RegenerateSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required'),
});

// POST /api/sessions/[id]/regenerate
// Archives all active items, then re-executes with the new prompt.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = Number(id);

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    if (session.status === 'pending') {
      return NextResponse.json({ error: 'Session is already executing' }, { status: 409 });
    }

    const body = await req.json();
    const { promptText } = RegenerateSchema.parse(body);

    await updateSessionStatus(sessionId, 'pending');

    // Archive current active items — they become part of history, not deleted
    await archiveItemsBySession(sessionId);

    // Create a new prompt revision
    const latest = await getLatestRevision(sessionId);
    const version = (latest?.version ?? 0) + 1;
    const revision = await createPromptRevision({ sessionId, promptText, version });

    // Re-execute LLM
    const llm = getLLMProvider();
    const { items, meta } = await llm.execute(promptText);

    // Persist execution metadata back onto the revision
    await updateRevisionMeta(revision.id, meta);

    const savedItems = await createContentItems(
      items.map((item, i) => ({
        sessionId,
        promptRevisionId: revision.id,
        title: item.title,
        body: item.body,
        category: item.category ?? null,
        sortOrder: i,
        status: 'active' as const,
      }))
    );

    await updateSessionStatus(sessionId, 'completed');

    return NextResponse.json({ revision, items: savedItems }, { status: 201 });
  } catch (error) {
    await updateSessionStatus(sessionId, 'failed').catch(() => {});
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/sessions/[id]/regenerate]', error);
    const message = error instanceof Error ? error.message : 'Regeneration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
