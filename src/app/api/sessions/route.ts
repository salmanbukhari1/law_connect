import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, listSessions } from '@/lib/db/repositories/sessions';

const CreateSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100),
});

// GET /api/sessions → list all sessions
export async function GET() {
  try {
    const data = await listSessions();
    return NextResponse.json({ sessions: data });
  } catch (error) {
    console.error('[GET /api/sessions]', error);
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}

// POST /api/sessions → create new session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = CreateSessionSchema.parse(body);
    const session = await createSession({ name });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[POST /api/sessions]', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
