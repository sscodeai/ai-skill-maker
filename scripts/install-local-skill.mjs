#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, copyFileSync, renameSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const home = process.env.HOME;
const defaultSkillsDir = process.env.CODEX_HOME ? join(process.env.CODEX_HOME, "skills") : join(home, ".codex", "skills");
const skillPayload = ["SKILL.md", "agents", "references", "assets", "scripts"];

function parseArgs(argv) {
  const args = { skillsDir: defaultSkillsDir };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--skills-dir") args.skillsDir = argv[++i];
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/install-local-skill.mjs [--skills-dir <dir>]`);
}

function copyDir(source, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(source)) {
    if (name === ".git") continue;
    const sourcePath = join(source, name);
    const destPath = join(dest, name);
    const stats = statSync(sourcePath);
    if (stats.isDirectory()) copyDir(sourcePath, destPath);
    else copyFileSync(sourcePath, destPath);
  }
}

function removeExtra(source, dest) {
  if (!existsSync(dest)) return;
  for (const name of readdirSync(dest)) {
    const sourcePath = join(source, name);
    const destPath = join(dest, name);
    if (!existsSync(sourcePath) || name === ".git") {
      rmSync(destPath, { recursive: true, force: true });
      continue;
    }
    if (statSync(destPath).isDirectory()) removeExtra(sourcePath, destPath);
  }
}

const args = parseArgs(process.argv);
if (args.help) {
  usage();
  process.exit(0);
}

const installDir = join(args.skillsDir, "ai-skill-maker");
mkdirSync(args.skillsDir, { recursive: true });
rmSync(installDir, { recursive: true, force: true });
mkdirSync(installDir, { recursive: true });
for (const name of skillPayload) {
  const sourcePath = join(repoRoot, name);
  if (!existsSync(sourcePath)) continue;
  const destPath = join(installDir, name);
  const stats = statSync(sourcePath);
  if (stats.isDirectory()) copyDir(sourcePath, destPath);
  else copyFileSync(sourcePath, destPath);
}

console.log(`Installed ${relative(process.cwd(), installDir) || installDir}`);
console.log(`Payload: ${skillPayload.join(", ")}`);
