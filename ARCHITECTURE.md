# Architecture & Design Decisions

This document explains the key architectural choices made in this project, the trade-offs considered, and how the system is designed to evolve.

---

## Data Model

Three tables represent three distinct concerns:

```
sessions (1) ──────< prompt_revisions (many)
sessions (1) ──────< content_items (many)
prompt_revisions (1) ──< content_items (many)
```

| Table | Represents | Changes when |
|---|---|---|
| `sessions` | A named workspace | User creates a session |
| `prompt_revisions` | An immutable input snapshot | User submits or re-submits a prompt |
| `content_items` | Individual structured output units | LLM responds |

### Why keep `prompt_revisions` and `content_items` separate?

They could be merged into one table, but shouldn't be. They represent different things:

- `prompt_revisions` is the **input** — what the user asked. It's immutable once created.
- `content_items` is the **output** — what the LLM generated. One revision produces many items.

Merging them would require duplicating the prompt text across every item (update anomaly risk), and would make it impossible to represent a revision where the LLM call failed (no items produced).

### Regeneration lifecycle

When a user regenerates with a new prompt, existing `active` content items are set to `archived` — they are **never deleted**. A new `prompt_revision` and new `active` items are created.

This makes the history explicit and reversible. The UI exposes archived items in a collapsible section so users can compare generations.

### Future-proofing in the schema

Every `prompt_revision` records LLM execution metadata:

- `model` — which model ran (enables A/B testing different models)
- `token_input` / `token_output` — enables cost dashboards and budget alerts
- `execution_time_ms` — latency monitoring and SLA tracking

`content_items` has a `sort_order` column (currently sequential) to support drag-and-drop reordering without changing `created_at` timestamps.

---

## LLM Provider — Strategy Pattern (Open/Closed Principle)

All LLM access goes through a single interface:

```typescript
interface LLMProvider {
  execute(prompt: string): Promise<LLMResult>;
}
```

A factory function reads the `LLM_PROVIDER` environment variable and returns the correct implementation:

```
src/lib/llm/
├── types.ts      ← LLMProvider interface + Zod schemas
├── openai.ts     ← OpenAI implementation (gpt-4o-mini via Vercel AI SDK)
├── mock.ts       ← Mock implementation (no API key needed)
└── index.ts      ← Factory: reads LLM_PROVIDER env var
```

**Adding a new provider (e.g. Anthropic, Gemini, local Ollama):**
1. Create `src/lib/llm/anthropic.ts` implementing `LLMProvider`
2. Add a case in `index.ts`
3. Zero changes anywhere else — routes, repositories, and components are untouched

This is the Open/Closed Principle in practice: the system is open for extension, closed for modification.

### Structured output

The LLM is instructed to return a specific JSON shape, validated with a Zod schema. The Vercel AI SDK's `generateObject` enforces this at the type level — if the LLM returns malformed output, it throws before any data is persisted.

---

## Repository Pattern — Separating Data Access

Routes never import Drizzle directly. All database operations go through repository functions:

```
src/lib/db/repositories/
├── sessions.ts           ← CRUD for sessions
├── prompt-revisions.ts   ← Create revisions, update execution metadata
└── content-items.ts      ← Create, archive, edit, delete items
```

**Why this matters:**

- Routes stay thin — they orchestrate, they don't query
- Swapping the database (e.g. SQLite → Postgres) is a change in `src/lib/db/index.ts` and the schema only — repositories stay the same
- Each repository function has a single responsibility and is easy to test in isolation

---

## Frontend State — TanStack Query

Server state is managed with TanStack Query (React Query) rather than `useState` + `useEffect` chains.

Key behaviours this enables:

- **Automatic polling** — `SessionView` polls every 1.5 seconds while `session.status === 'pending'` and stops automatically on completion or failure
- **Cache invalidation** — after any mutation (execute, regenerate, edit, delete), the relevant queries are invalidated and data refetches without a page reload
- **Loading and error states** — handled declaratively per query, not via ad-hoc boolean flags

---

## API Design

All routes follow REST conventions and return consistent JSON shapes:

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/sessions` | List all sessions |
| `POST` | `/api/sessions` | Create a session |
| `GET` | `/api/sessions/:id` | Session detail (items + revisions) |
| `DELETE` | `/api/sessions/:id` | Delete a session and all its data |
| `POST` | `/api/sessions/:id/execute` | Run LLM, persist output |
| `POST` | `/api/sessions/:id/regenerate` | Archive active items, re-run LLM |
| `PATCH` | `/api/items/:id` | Edit an item's title or body |
| `DELETE` | `/api/items/:id` | Hard-delete a single item |

Input validation uses Zod on every route. Errors return structured JSON with an `error` field and the appropriate HTTP status code.

---

## Database Migration Strategy

`src/lib/db/schema.ts` is the single source of truth for the database structure. Drizzle Kit syncs the SQLite file to match the schema automatically:

```bash
npm run dev    # runs drizzle-kit push before starting the server
npm run build  # runs drizzle-kit push before building
npm install    # postinstall hook also runs drizzle-kit push
```

This means there is no separate migration step — cloning the repo and running `npm install` is sufficient to get a fully initialised database.
