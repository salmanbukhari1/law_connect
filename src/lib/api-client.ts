import type { Session, ContentItem, PromptRevision } from '@/lib/db/schema';

export type { Session, ContentItem, PromptRevision };

export interface SessionDetail {
  session: Session;
  activeItems: ContentItem[];
  archivedItems: ContentItem[];
  revisions: PromptRevision[];
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch('/api/sessions');
  if (!res.ok) throw new Error('Failed to load sessions');
  const data = await res.json();
  return data.sessions;
}

export async function createSession(name: string): Promise<Session> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Failed to create session');
  }
  const data = await res.json();
  return data.session;
}

export async function deleteSession(id: number): Promise<void> {
  const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
}

// ─── Session Detail ───────────────────────────────────────────────────────────

export async function fetchSessionDetail(id: number): Promise<SessionDetail> {
  const res = await fetch(`/api/sessions/${id}`);
  if (!res.ok) throw new Error('Failed to load session');
  const data = await res.json();
  return {
    session: data.session,
    activeItems: data.activeItems,
    archivedItems: data.archivedItems,
    revisions: data.revisions,
  };
}

// ─── Execution & Regeneration ─────────────────────────────────────────────────

export async function executePrompt(
  sessionId: number,
  promptText: string
): Promise<{ items: ContentItem[] }> {
  const res = await fetch(`/api/sessions/${sessionId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptText }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Execution failed');
  }
  return res.json();
}

export async function regeneratePrompt(
  sessionId: number,
  promptText: string
): Promise<{ items: ContentItem[] }> {
  const res = await fetch(`/api/sessions/${sessionId}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptText }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Regeneration failed');
  }
  return res.json();
}

// ─── Content Items ────────────────────────────────────────────────────────────

export async function updateItem(
  id: number,
  data: { title?: string; body?: string; category?: string }
): Promise<ContentItem> {
  const res = await fetch(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update item');
  const json = await res.json();
  return json.item;
}

export async function deleteItem(id: number): Promise<void> {
  const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete item');
}
