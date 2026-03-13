import { eq, desc } from 'drizzle-orm';
import { db } from '../index';
import { sessions, type NewSession, type Session } from '../schema';

export async function createSession(data: Pick<NewSession, 'name'>): Promise<Session> {
  const result = db.insert(sessions).values({ name: data.name }).returning().get();
  return result;
}

export async function listSessions(): Promise<Session[]> {
  return db.select().from(sessions).orderBy(desc(sessions.createdAt)).all();
}

export async function getSession(id: number): Promise<Session | undefined> {
  return db.select().from(sessions).where(eq(sessions.id, id)).get();
}

export async function updateSessionStatus(
  id: number,
  status: Session['status']
): Promise<void> {
  db.update(sessions)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(sessions.id, id))
    .run();
}

export async function deleteSession(id: number): Promise<void> {
  db.delete(sessions).where(eq(sessions.id, id)).run();
}
