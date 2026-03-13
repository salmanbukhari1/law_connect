import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── Sessions ────────────────────────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  status: text('status', { enum: ['idle', 'pending', 'completed', 'failed'] })
    .notNull()
    .default('idle'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Prompt Revisions ────────────────────────────────────────────────────────
// Immutable record of every prompt submission (including regenerations).
// Stores execution metadata for cost tracking, debugging, and model comparison.
export const promptRevisions = sqliteTable('prompt_revisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  promptText: text('prompt_text').notNull(),
  version: integer('version').notNull().default(1),

  // ── LLM execution metadata ──────────────────────────────────────────────
  // Nullable: populated after a successful LLM call.
  // Future use: cost dashboards, model comparisons, performance monitoring.
  model: text('model'),                          // e.g. "gpt-4o-mini"
  tokenInput: integer('token_input'),            // prompt tokens consumed
  tokenOutput: integer('token_output'),          // completion tokens generated
  executionTimeMs: integer('execution_time_ms'), // wall-clock latency

  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// ─── Content Items ────────────────────────────────────────────────────────────
// Each LLM output is broken into individual structured items.
// On regeneration, active items are archived — nothing is permanently deleted.
export const contentItems = sqliteTable('content_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  promptRevisionId: integer('prompt_revision_id')
    .notNull()
    .references(() => promptRevisions.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  category: text('category'),

  // Display order — nullable so existing items default to creation order.
  // Future use: drag-and-drop reordering without changing createdAt.
  sortOrder: integer('sort_order'),

  // 'active' = current generation; 'archived' = from a previous generation
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type PromptRevision = typeof promptRevisions.$inferSelect;
export type NewPromptRevision = typeof promptRevisions.$inferInsert;
export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;
