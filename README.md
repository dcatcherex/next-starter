# Next Starter

Next.js 16 (App Router) + Clerk + Drizzle/Neon Postgres + shadcn/ui (Base UI) + Tailwind 4.

## Setup

```bash
pnpm install
cp .env.example .env.local     # or: vercel env pull .env.local
# fill DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000, sign in, then visit `/notes` to smoke-test auth + database.

## Scripts

| Script                            | Purpose                           |
| --------------------------------- | --------------------------------- |
| `pnpm dev` / `build` / `start`    | Next.js                           |
| `pnpm lint` / `pnpm format`       | ESLint / Prettier                 |
| `pnpm db:generate` / `db:migrate` | Create / apply Drizzle migrations |
| `pnpm db:push`                    | Prototyping only                  |
| `pnpm db:studio`                  | Drizzle Studio                    |

Build without real secrets: `SKIP_ENV_VALIDATION=1 pnpm build`.

## Add-ons (shadcn registry `@starter`)

```bash
pnpm dlx shadcn@latest add @starter/storage-vercel-blob --overwrite
pnpm dlx shadcn@latest add @starter/storage-r2 --overwrite
pnpm dlx shadcn@latest add @starter/clerk-webhook-sync --overwrite
```

- `storage-r2` requires a CORS rule on the R2 bucket allowing `PUT` from your app origin(s):
  ```json
  [
    {
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://your-app.vercel.app"
      ],
      "AllowedMethods": ["PUT", "GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```
- `clerk-webhook-sync`: run `pnpm db:generate && pnpm db:migrate`, then add `https://<your-domain>/api/webhooks/clerk` in the Clerk dashboard and set `CLERK_WEBHOOK_SIGNING_SECRET`.

See `AGENTS.md` for project conventions.
