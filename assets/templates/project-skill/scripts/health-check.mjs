#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const packagePath = "package.json";

if (!existsSync(packagePath)) {
  console.log("No package.json found; define project-specific health checks here.");
  process.exit(0);
}

const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
const preferred = ["lint", "typecheck", "test", "build"].filter((name) => pkg.scripts?.[name]);

if (preferred.length === 0) {
  console.log("No standard package scripts found. Add project-specific checks here.");
  process.exit(0);
}

const runner = existsSync("pnpm-lock.yaml") ? "pnpm" : existsSync("yarn.lock") ? "yarn" : "npm";

for (const script of preferred) {
  const args = runner === "npm" ? ["run", script] : [script];
  console.log(`\n> ${runner} ${args.join(" ")}`);
  const result = spawnSync(runner, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
