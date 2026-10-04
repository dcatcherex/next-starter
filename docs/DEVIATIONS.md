# Deviations from next-starter-PLAN.md

Where current docs/CLIs differed from the plan (the docs won).

## Phase 1

- **pnpm version:** create-next-app wrote `"packageManager": "pnpm@12.9.0"`; pinned back to 11.5.1 and removed the stale pnpm self-install section from the lockfile.
- **shadcn init flags:** `--preset base-nova` is rejected (`Invalid preset`; presets are nova, vega, maia, ...). Used `shadcn init --preset nova --base base --yes`, which produced a `components.json` identical to my-care's (style `base-nova`, neutral, lucide, menuColor default, menuAccent subtle). Added `registries["@starter"]` by hand.
- **`cn` package:** current shadcn generates `import { cn } from "cn"` and `lib/utils.ts` as `export { cn } from "cn"` (the `cn` npm package, same as my-care). Kept as generated.
- **`form` component:** does not exist for base-nova. Used `field` (`Field`, `FieldGroup`, `FieldLabel`, `FieldError`) with react-hook-form `Controller` + zod, per current shadcn rules.
- **Toasts:** base-nova also offers a Base UI `toast` component; the plan specifies sonner, so `sonner` is used and the generated `toast.tsx` was removed.
- **pnpm-workspace.yaml:** create-next-app already generated the `allowBuilds` block (sharp/unrs-resolver false); left as is.
- **`hooks/use-mobile.ts`:** the generated hook fails the new `react-hooks/set-state-in-effect` lint rule. Rewrote with `useSyncExternalStore`.

## Phase 2

- **Clerk setup by hand:** `clerk init` would provision an accountless cloud application, which is an outward-facing action. Wrote `proxy.ts`, provider, and sign-in/up pages manually following the clerk-setup/clerk-nextjs-patterns skills (`Show` component, `await auth()`, `proxy.ts`).
- **Clerk theme:** added `@clerk/ui` and applied `shadcn` theme + `@clerk/ui/themes/shadcn.css` (clerk-setup step 5), so Clerk components follow the shadcn dark mode tokens.
- **Notes schema split:** `"use server"` files may only export async functions, so the zod schema lives in `app/(app)/notes/schema.ts`.
- **`@next/env` devDependency:** needed explicitly (pnpm strict) for `drizzle.config.ts`.
- **`.gitignore`:** create-next-app ignores `.env*`; added `!.env.example`.
- **Landing page:** buttons are conditional (Sign in when signed out, Go to app when signed in).
- **`db:generate` hangs without stdin** in non-TTY agent shells only when stdin is open; run with `</dev/null` if scripting.

## Phase 3

- **`registry:item` + `registry:file`:** all items are `registry:item` with `registry:file` entries and explicit `~/` targets (project root; no src dir). `envVars` is supported by the current schema and is used (empty values), plus env documented in `description`/`docs`.
- **Vercel Blob route shape:** `handleUpload` cannot rewrite the pathname (token is bound to the client-supplied one), so the `${userId}/` prefix is enforced by rejecting any other path. The client fetches the prefix via `GET /api/upload` (extra tiny round trip) and builds `${userId}/${folder}/${name}`; `addRandomSuffix: true`. `getFileUrl` uses `head(key).url`. Blob stores are now public or private (`@vercel/blob` 2.x); the add-on assumes a **public** store (`vercel blob create-store <name> --access public`). A private store would need `access: "private"` and a streaming route.
- **R2 route** returns `{ uploadUrl, key, readUrl }` (public URL if `R2_PUBLIC_URL`, else 1h presigned GET) so the client can return a usable `StoredFile.url`; the plan only specified the PUT URL + key. The route accepts an optional `folder` in the body.
- **pnpm 11 `ERR_PNPM_IGNORED_BUILDS`:** the scratch installs failed until `core-js` and `esbuild` were added (as `false`) to `allowBuilds` in `pnpm-workspace.yaml`.
- **Registry test on Windows:** `shadcn add D:\abs\path.json` fails with `unknown scheme` (drive letter read as URL scheme). `scripts/test-registry.mjs` copies the item JSON into the scratch dir and installs it via `./_item.json`.
- **tsconfig/eslint:** `registry`, `public/r`, `scripts` excluded from `tsc`; `public/r/**` ignored by ESLint (registry sources import files that only exist after install).

## Phase 4/5

- `scripts/starter-cleanup.mjs` also removes `docs/` and `scripts/` if they end up empty.
- Skill step 2 uses `pnpm create next-app@latest <name> -e <repo> --use-pnpm --yes` (added `--yes`); not exercised here since the repo is not pushed. Vercel integration slugs (`neon`, `clerk`) are taken from the vercel-storage skill and must be re-verified with `vercel integration discover` at run time (not run here: no outward actions).
