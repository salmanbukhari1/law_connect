import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  updateContentItem,
  deleteContentItem,
  getContentItem,
} from '@/lib/db/repositories/content-items';

const PatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  category: z.string().max(50).optional(),
});

// PATCH /api/items/[id] → edit a content item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemId = Number(id);
    const existing = await getContentItem(itemId);
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    const body = await req.json();
    const data = PatchSchema.parse(body);
    const updated = await updateContentItem(itemId, data);
    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('[PATCH /api/items/[id]]', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE /api/items/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteContentItem(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/items/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
