import { NextRequest, NextResponse } from 'next/server';
import { getSession, deleteSession } from '@/lib/db/repositories/sessions';
import { getActiveItems, getArchivedItems } from '@/lib/db/repositories/content-items';
import { listRevisions } from '@/lib/db/repositories/prompt-revisions';

// GET /api/sessions/[id] → full session detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = Number(id);
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const [activeItems, archivedItems, revisions] = await Promise.all([
      getActiveItems(sessionId),
      getArchivedItems(sessionId),
      listRevisions(sessionId),
    ]);
    return NextResponse.json({ session, activeItems, archivedItems, revisions });
  } catch (error) {
    console.error('[GET /api/sessions/[id]]', error);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}

// DELETE /api/sessions/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSession(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/sessions/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
