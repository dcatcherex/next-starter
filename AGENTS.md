<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Conventions

- **Auth:** every server action and route handler calls `await auth()` (from `@clerk/nextjs/server`) and scopes data by `userId`. Public routes are declared in `proxy.ts` (Next 16 replaces `middleware.ts`).
- **Tables:** every user-owned table has a `userId` text column (Clerk user id). Schema lives in `db/schema/*.ts` (one file per table; import directly, no barrel).
- **Migrations:** `pnpm db:generate` then `pnpm db:migrate`. `db:push` is for throwaway prototyping only.
- **Storage:** only through `lib/storage/{types,server,client}.ts`. Install a provider with `pnpm dlx shadcn@latest add @starter/storage-vercel-blob --overwrite` (or `storage-r2`).
- **Env:** base vars are validated in `env.ts`. Add-ons parse their own vars locally with zod. List every var in `.env.example`. Builds without secrets: `SKIP_ENV_VALIDATION=1 pnpm build`.
- **UI:** shadcn/ui on **Base UI** (style `base-nova`), not Radix. Use `render` (not `asChild`) for custom triggers. Toasts use `sonner`.
- **Forms:** react-hook-form + zod + shadcn `Field` components.
