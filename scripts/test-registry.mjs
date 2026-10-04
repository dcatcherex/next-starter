// Installs each registry item into a scratch copy of the base and verifies
// that the app still builds and type-checks. No network access to the hosted
// registry is needed: items are installed from public/r/*.json by path.
// Usage: node scripts/test-registry.mjs [item ...]   (default: all items)
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdtempSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const EXCLUDE = new Set([
  "node_modules",
  ".next",
  ".git",
  "registry",
  "skills",
  "tsconfig.tsbuildinfo",
]);

const items = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(path.join(root, "public", "r"))
      .filter((f) => f.endsWith(".json") && f !== "registry.json")
      .map((f) => f.replace(/\.json$/, ""));

function run(cmd, cwd, env = {}) {
  console.log(`\n$ ${cmd}  (${path.basename(cwd)})`);
  const r = spawnSync(cmd, {
    cwd,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...env, CI: "1" },
  });
  if (r.status !== 0) throw new Error(`Command failed: ${cmd}`);
}

const results = [];
for (const item of items) {
  const scratch = mkdtempSync(path.join(tmpdir(), `starter-test-${item}-`));
  try {
    cpSync(root, scratch, {
      recursive: true,
      filter: (src) => {
        const rel = path.relative(root, src).split(path.sep);
        if (EXCLUDE.has(rel[0] ?? "")) return false;
        if (rel[0] === "public" && rel[1] === "r") return false;
        if (rel[0] === "scripts" && rel[1] === "test-registry.mjs")
          return false;
        return true;
      },
    });
    const json = path.join(root, "public", "r", `${item}.json`);
    run("pnpm install --no-frozen-lockfile", scratch);
    // Windows drive-letter paths are misread as URL schemes: use a relative path.
    copyFileSync(json, path.join(scratch, "_item.json"));
    run("pnpm dlx shadcn@latest add ./_item.json --overwrite --yes", scratch);
    run("pnpm build", scratch, { SKIP_ENV_VALIDATION: "1" });
    run("pnpm tsc --noEmit", scratch);
    results.push([item, "PASS"]);
  } catch (e) {
    results.push([item, `FAIL (${e.message})`]);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

console.log("\n=== Registry test results ===");
for (const [item, status] of results) console.log(`${item}: ${status}`);
if (results.some(([, s]) => s !== "PASS")) process.exit(1);
