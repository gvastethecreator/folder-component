import { existsSync, rmSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  "dist",
  "coverage",
  "node_modules/.vite",
  "test-results",
  "playwright-report",
  ".local",
  ".scratch/verification",
  "logs/dev-server.err.log",
  "logs/dev-server.out.log",
  "logs/ui-verification",
];

let removed = 0;

for (const target of targets) {
  const resolvedTarget = resolve(root, target);
  if (!resolvedTarget.startsWith(`${root}${sep}`)) {
    throw new Error(`Refusing to clean outside the repository: ${target}`);
  }
  if (!existsSync(resolvedTarget)) continue;
  rmSync(resolvedTarget, { recursive: true, force: true });
  removed += 1;
  console.log(`removed ${target}`);
}

console.log(`clean complete: ${removed} generated paths removed`);
