# AI Blog Generator (Next.js + TypeScript)

This is a full‑stack Next.js app that generates blog posts using GROQ. You type a topic, the server creates a title and a full Markdown article.

## Tech stack

- Next.js App Router (TypeScript)
- GROQ SDK (LLM)
- Zod (request validation)
- Tailwind CSS + simple animations (framer‑motion)
- Prisma ORM (with PostgreSQL, optional)

## How it works

1. The page has a simple form where you enter a topic.
2. The server API at `app/api/blogs/route.ts` validates the input with Zod.
3. A small “graph” function runs two steps: make a title, then make content.
4. The GROQ client calls the model (default: `llama-3.1-8b-instant`).
5. The page shows the generated title and Markdown content.

## Setup

1. Install deps:

```bash
pnpm install
```

2. Set your environment:

```bash
cp .env.example .env.local
# then edit .env.local and add your GROQ_API_KEY
```

3. (Optional) Set up a Postgres database and set `DATABASE_URL` in `.env.local`, then:

```bash
pnpm prisma generate
pnpm prisma db push
```

4. Run the app:

```bash
pnpm dev
```

Visit http://localhost:3000

## Environment variables

- `GROQ_API_KEY`: required for GROQ.
- `DATABASE_URL`: Postgres connection string (only if you want to save blogs).

## Where is the code?

- API route: `src/app/api/blogs/route.ts`
- GROQ client: `src/lib/llm/groq.ts`
- “Graph” (orchestrator): `src/lib/graph/blogGraph.ts`
- Zod schema: `src/lib/validation/blog.ts`
- UI page: `src/app/page.tsx`

## Notes

- The project focuses on being clear and simple. Files are small and easy to read.
- You can later add storage using Prisma and the `Blog` model if needed.
