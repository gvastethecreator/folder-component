import { rmSync } from "node:fs";

const targets = ["dist", "coverage", "node_modules/.vite"];

for (const target of targets) {
  rmSync(target, { recursive: true, force: true });
}

console.log("cleaned: " + targets.join(", "));
