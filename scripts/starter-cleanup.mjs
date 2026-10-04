// Strips starter-only files from a freshly generated app.
// Run once from the app root: node scripts/starter-cleanup.mjs
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

const targets = [
  "registry",
  "registry.json",
  "public/r",
  "skills",
  "scripts/test-registry.mjs",
  "docs/DEVIATIONS.md",
  "scripts/starter-cleanup.mjs", // itself
];

for (const t of targets) {
  if (existsSync(t)) {
    rmSync(t, { recursive: true, force: true });
    console.log(`removed ${t}`);
  }
}

// Remove directories left empty
for (const d of ["docs", "scripts"]) {
  if (existsSync(d) && readdirSync(d).length === 0) {
    rmSync(d, { recursive: true });
    console.log(`removed empty ${d}`);
  }
}

if (existsSync("package.json")) {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  if (pkg.scripts && "registry:build" in pkg.scripts) {
    delete pkg.scripts["registry:build"];
    writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
    console.log('removed "registry:build" script');
  }
}
// components.json keeps registries["@starter"] on purpose.
