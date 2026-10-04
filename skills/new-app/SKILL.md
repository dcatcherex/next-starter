---
name: new-app
description: Scaffold a new Next.js app from my personal starter (github.com/dcatcherex/next-starter) - Next 16, Clerk, Drizzle + Neon, shadcn on Base UI, optional storage and webhook add-ons. Use when the user says "new app", "start a new project", "scaffold from my starter", "/new-app", or "create an app from next-starter".
---

# New App (from next-starter)

Creates a new app from `dcatcherex/next-starter`, strips starter-only files, installs chosen add-ons from the `@starter` shadcn registry, and (after confirmation) wires Vercel, Neon and Clerk.

Environment assumptions: Windows 11, Node 24, pnpm, `gh` and `vercel` CLIs logged in. Use non-interactive flags. Run commands with Bash (Git Bash) or PowerShell as appropriate.

## 1. Ask the user

Ask (skip anything already provided):

1. **App name** (kebab-case, becomes the directory and package name)
2. **Parent directory** (default `D:\ai\app`)
3. **Storage**: `vercel-blob` | `r2` | none
4. **Clerk webhook user sync** (y/n)

## 2. Create the app

```bash
cd <parent-dir>
pnpm create next-app@latest <name> -e https://github.com/dcatcherex/next-starter --use-pnpm --yes
```

Fallback if that fails (e.g. the example flag cannot read the repo):

```bash
gh repo clone dcatcherex/next-starter <name> -- --depth 1
rm -rf <name>/.git
cd <name> && pnpm install
```

## 3. Strip starter-only files

```bash
cd <name>
node scripts/starter-cleanup.mjs
```

This removes `registry/`, `registry.json`, `public/r/`, `skills/`, the registry test script, `docs/DEVIATIONS.md`, itself, and the `registry:build` script. `components.json` keeps `registries["@starter"]`.

## 4. Install add-ons

Always pass `--overwrite --yes` (the storage add-ons replace the base stubs in `lib/storage/*`):

```bash
pnpm dlx shadcn@latest add @starter/storage-vercel-blob --overwrite --yes   # if vercel-blob
pnpm dlx shadcn@latest add @starter/storage-r2 --overwrite --yes            # if r2
pnpm dlx shadcn@latest add @starter/clerk-webhook-sync --overwrite --yes    # if webhook sync
```

If the registry is not reachable yet (starter not deployed), tell the user; do not guess alternatives. Webhook sync adds `db/schema/users.ts`, so run `pnpm db:generate` afterwards.

## 5. Git

```bash
git init
git add -A
git commit -m "Initial commit from next-starter"
```

(End commit messages with the attribution line required by the current Claude Code session.)

## 6. Cloud wiring - CONFIRM FIRST

These steps create real accounts/resources. List exactly what will be created and **wait for an explicit yes** before running any of them.

1. `vercel link` (create/link a project named `<name>`).
2. Neon Postgres: `vercel integration add neon` (verify the slug first with `vercel integration discover neon` or the `vercel:marketplace` skill). This injects `DATABASE_URL`.
3. Clerk: `vercel integration add clerk` (verify the slug the same way). This injects the Clerk keys. If the integration does not provide `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`, use `npx -y clerk@latest` per the `clerk-setup` skill or the dashboard.
4. Pull env: `vercel env pull .env.local --yes`
5. Storage:
   - **vercel-blob**: `vercel blob create-store <name>-blob --access public` (the add-on code uses public access; a private store needs code changes), or create the store in the dashboard and connect it to the project. Then `vercel env pull .env.local --yes` to get `BLOB_READ_WRITE_TOKEN`.
   - **r2**: walk the user through Cloudflare: create a bucket, create an R2 API token (Object Read & Write), note the account id, optionally enable a public domain. Then set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and optionally `R2_PUBLIC_URL` via `vercel env add <VAR>` for each, then `vercel env pull .env.local --yes`. Add the CORS rule below to the bucket.
6. Webhook sync: the signing secret comes from the Clerk dashboard endpoint (see checklist).

## 7. Migrate, run, smoke test

```bash
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000, sign up/in, then visit `/notes` and create a note.

## 8. Print the manual checklist

Only list the items that apply:

- [ ] **Clerk webhook** (if webhook sync): in the Clerk dashboard add endpoint `https://<domain>/api/webhooks/clerk` for `user.created`, `user.updated`, `user.deleted`; copy the signing secret into `CLERK_WEBHOOK_SIGNING_SECRET` (`vercel env add`, then `vercel env pull`). Local dev: `clerk webhooks listen --token "$(clerk webhooks token)" --forward-to http://localhost:3000/api/webhooks/clerk`.
- [ ] **R2 CORS** (if r2): bucket CORS must allow PUT from the app origins:
  ```json
  [
    {
      "AllowedOrigins": ["http://localhost:3000", "https://<domain>"],
      "AllowedMethods": ["PUT", "GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```
- [ ] Claim/production-configure Clerk (`clerk deploy`) before going live.
- [ ] Push to GitHub and connect the repo to the Vercel project when ready (`gh repo create` - only on the user's request).
