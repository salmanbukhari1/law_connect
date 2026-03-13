# PromptLab — LLM Content Studio

A full-stack web app for exploring, refining, and managing LLM-generated content through an iterative prompt-based workflow. Built with Next.js, TypeScript, Tailwind CSS, and Drizzle ORM.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Drizzle ORM |
| Database | SQLite (via `better-sqlite3`) |
| LLM | OpenAI `gpt-4o-mini` (via Vercel AI SDK) |
| State | TanStack Query (React Query) |

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- An **OpenAI API key** — [get one here](https://platform.openai.com/api-keys)
  *(or use the built-in mock provider — no API key needed)*

### 1. Clone the repository

```bash
git clone <repo-url>
cd law_connect
```

### 2. Install dependencies

```bash
npm install
```

> This automatically creates and migrates the local SQLite database. No separate DB setup required.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
# Use 'openai' for real generations, or 'mock' for zero-config testing
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Run the app

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Syncs DB schema and starts the dev server |
| `npm run build` | Syncs DB schema and builds for production |
| `npm start` | Starts the production server |
| `npm run db:push` | Manually sync the DB schema from `schema.ts` |

---

## Database

The app uses **SQLite** stored at `./local.db`. No server or credentials required.

**Reset the database:**
```bash
rm local.db && npm run db:push
# Then restart the dev server
```

**Browse the database:** open `./local.db` in [TablePlus](https://tableplus.com/) or [DB Browser for SQLite](https://sqlitebrowser.org/).

> The schema in `src/lib/db/schema.ts` is the single source of truth. Run `npm run db:push` after any schema change.
