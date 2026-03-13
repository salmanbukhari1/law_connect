## Senior Full-Stack Engineer Take-Home Assignment  
**Exploratory LLM-Driven Application**

---

## Context

This exercise is designed to understand how you approach designing and building a small but complete system that integrates a Large Language Model (LLM) into a modern full-stack web application.

Rather than prescribing exact implementation details, this assignment intentionally leaves room for interpretation. We are interested in the **decisions you make**, the **trade-offs you consider**, and how you structure a system that could reasonably evolve beyond its initial scope.

As such, it is expected that you will approach this assignment like you would day-to-day work: use coding agents as much or as little as necessary to achieve your highest quality result.

---

## Problem Statement

Build a production-ready web application that allows a user to explore, refine, and manage LLM-generated content through an iterative prompt-based workflow.

At a high level, the system should:

- Accept user prompts
- Generate structured output via an LLM
- Persist and present that output in an editable form
- Support regeneration as the prompt evolves

Assume a single user and a controlled environment, but design with clarity and intentionality.

---

## Core Capabilities

### 1. Prompt Execution

- Provide a UI for submitting free-form prompts.
- On submission, execute the prompt against an LLM of your choice.
- Clearly represent execution states (e.g. pending, completed, failed).
- You may choose how much control (if any) to expose over model configuration.

---

### 2. Output Modeling & Persistence

- Convert LLM output into a set of **persisted entities**.
- Decide how structured the output should be.
- Store all generated data using Drizzle ORM.
- The data model should reflect how you expect the system to be used and extended.

We care more about **your modeling decisions** than the exact schema.

---

### 3. Content Management

- Present generated content in a way that encourages review and iteration.
- Allow editing and deletion of individual items.
- Ensure changes are durable and reflected consistently in the UI.

---

### 4. Regeneration & Lifecycle

- Allow the user to modify an existing prompt and re-execute it.
- Define and implement a clear lifecycle for generated content when regeneration occurs.
- Make this behavior explicit in the UI.

There is no single correct approach here—justify the one you choose.

---

## Technical Constraints

You must use the following technologies:
- Next.js
- TypeScript
- Tailwind CSS
- Drizzle ORM

All other architectural and technology decisions are yours.

---

## Execution Requirements

The application must build and run in simple steps:
- Install packages: `[package_manager_of_choice] install`
- Build: e.g. `next build` if necessary
- Run: e.g. `next start`

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- An **OpenAI API key** — [get one here](https://platform.openai.com/api-keys)  
  *(or skip this and use the built-in mock provider for zero-config testing)*

### 1. Clone the repository

```bash
git clone <repo-url>
cd law_connect
```

### 2. Install dependencies

```bash
npm install
```

> This automatically creates and migrates the local SQLite database via `drizzle-kit push`. No separate DB setup required.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set your OpenAI API key:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
```

**No API key?** Set `LLM_PROVIDER=mock` instead — the app will run with a built-in mock provider that returns sample content without making any API calls.

### 4. Run the app

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Database

The app uses **SQLite** — a local file at `./local.db`. No server or credentials required.

To reset the database, delete `local.db` and run `npm run db:push` to recreate it from the schema:

```bash
rm local.db
npm run db:push
```

To browse the database, open `./local.db` in [TablePlus](https://tableplus.com/) or [DB Browser for SQLite](https://sqlitebrowser.org/) (both free).

---

### Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Drizzle ORM |
| Database | SQLite (via `better-sqlite3`) |
| LLM | OpenAI `gpt-4o-mini` (via Vercel AI SDK) |
| State | TanStack Query (React Query) |
