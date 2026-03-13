import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLLMProvider } from '@/lib/llm';
import { getSession, updateSessionStatus } from '@/lib/db/repositories/sessions';
import { createPromptRevision, getLatestRevision, updateRevisionMeta } from '@/lib/db/repositories/prompt-revisions';
import { createContentItems } from '@/lib/db/repositories/content-items';

const ExecuteSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required'),
});

// POST /api/sessions/[id]/execute
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
    const { promptText } = ExecuteSchema.parse(body);

    // Mark session as pending immediately
    await updateSessionStatus(sessionId, 'pending');

    // Get next version number
    const latest = await getLatestRevision(sessionId);
    const version = (latest?.version ?? 0) + 1;

    // Persist prompt revision
    const revision = await createPromptRevision({ sessionId, promptText, version });

    // Execute against LLM
    const llm = getLLMProvider();
    const { items, meta } = await llm.execute(promptText);

    // Persist execution metadata back onto the revision
    await updateRevisionMeta(revision.id, meta);

    // Persist content items with sort order
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
    // Ensure session is marked failed on any error
    await updateSessionStatus(sessionId, 'failed').catch(() => {});
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/sessions/[id]/execute]', error);
    const message = error instanceof Error ? error.message : 'Execution failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
