import { and, desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { contentItems, type ContentItem, type NewContentItem } from '../schema';

export async function createContentItems(
  items: NewContentItem[]
): Promise<ContentItem[]> {
  return db.insert(contentItems).values(items).returning().all();
}

export async function getActiveItems(sessionId: number): Promise<ContentItem[]> {
  return db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.sessionId, sessionId), eq(contentItems.status, 'active')))
    .orderBy(desc(contentItems.createdAt))
    .all();
}

export async function getArchivedItems(sessionId: number): Promise<ContentItem[]> {
  return db
    .select()
    .from(contentItems)
    .where(and(eq(contentItems.sessionId, sessionId), eq(contentItems.status, 'archived')))
    .orderBy(desc(contentItems.createdAt))
    .all();
}

export async function archiveItemsBySession(sessionId: number): Promise<void> {
  db.update(contentItems)
    .set({ status: 'archived', updatedAt: new Date().toISOString() })
    .where(and(eq(contentItems.sessionId, sessionId), eq(contentItems.status, 'active')))
    .run();
}

export async function updateContentItem(
  id: number,
  data: Partial<Pick<ContentItem, 'title' | 'body' | 'category'>>
): Promise<ContentItem | undefined> {
  return db
    .update(contentItems)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(contentItems.id, id))
    .returning()
    .get();
}

export async function deleteContentItem(id: number): Promise<void> {
  db.delete(contentItems).where(eq(contentItems.id, id)).run();
}

export async function getContentItem(id: number): Promise<ContentItem | undefined> {
  return db.select().from(contentItems).where(eq(contentItems.id, id)).get();
}
