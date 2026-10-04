# Deviations from next-starter-PLAN.md

Where current docs/CLIs differed from the plan (the docs won).

## Phase 1
- **pnpm version:** create-next-app wrote `"packageManager": "pnpm@12.9.0"` (the pnpm that ran in this environment), not 11.5.1.
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
