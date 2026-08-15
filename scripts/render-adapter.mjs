#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, normalize } from "node:path";

const adapters = new Set(["agents", "claude", "cursor", "copilot"]);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input") args.input = argv[++i];
    else if (arg === "--adapter") args.adapter = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--force") args.force = true;
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/render-adapter.mjs --input config.json --adapter agents|claude|cursor|copilot --output <path-or-dir> [--force]`);
}

function section(title, value) {
  const text = String(value || "").trim();
  return text ? `## ${title}\n\n${text}\n` : "";
}

function compact(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function header(name) {
  return `<!-- BEGIN AI-PROJECT-SKILL-MAKER -->\n<!-- Generated from ${name}. Edit source config or maintainer references, then regenerate. -->\n`;
}

function footer() {
  return "<!-- END AI-PROJECT-SKILL-MAKER -->\n";
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function generatedBlockPattern() {
  return /(?:---\n[\s\S]*?\n---\n\n)?<!-- BEGIN AI-PROJECT-SKILL-MAKER -->[\s\S]*?<!-- END AI-PROJECT-SKILL-MAKER -->\n?/;
}

function common(config, target) {
  return `${header(config.projectName || "project config")}# ${config.projectName || "Project"} ${target}\n\n` +
    section("Purpose", compact(config.projectPurpose)) +
    section("Audience", compact(config.audience)) +
    section("Project Map", compact([config.importantPaths, config.entryPoints].filter(Boolean).join("\n"))) +
    section("Architecture", compact([config.systemShape, config.dataFlow, config.integrationPoints].filter(Boolean).join("\n"))) +
    section("Coding Standards", compact([config.stylePatterns, config.dependencyPolicy, config.patternsToAvoid].filter(Boolean).join("\n"))) +
    section("Content Style", compact([config.languagePolicy, config.toneAndNaming, config.documentationConventions].filter(Boolean).join("\n"))) +
    section("Verification", compact([config.verificationCommands, config.manualQa, config.riskGates].filter(Boolean).join("\n"))) +
    section("Generated Files and Edit Restrictions", compact([config.generatedOutput, config.lockfiles, config.snapshotsSchemasVendored, config.editRestrictions].filter(Boolean).join("\n"))) +
    section("Release", compact([config.versioning, config.changelog, config.deployPublish, config.rollback].filter(Boolean).join("\n"))) +
    footer();
}

function renderAgents(config) {
  return common(config, "Agent Instructions");
}

function renderClaude(config) {
  return common(config, "Claude Instructions").replace(/Codex/g, "AI coding agent");
}

function renderCopilot(config) {
  return common(config, "Copilot Instructions");
}

function renderCursor(config) {
  return `---
description: ${yamlString(`Project-wide AI coding rules for ${config.projectName || "this project"}`)}
alwaysApply: true
---

${common(config, "Cursor Rules")}`;
}

function outputPath(adapter, output) {
  if (adapter === "agents") return output.endsWith(".md") ? output : join(output, "AGENTS.md");
  if (adapter === "claude") return output.endsWith(".md") ? output : join(output, "CLAUDE.md");
  if (adapter === "copilot") {
    if (output.endsWith(".md")) return output;
    if (basename(normalize(output)) === ".github") return join(output, "copilot-instructions.md");
    return join(output, ".github", "copilot-instructions.md");
  }
  if (adapter === "cursor") {
    if (output.endsWith(".mdc")) return output;
    const normalized = normalize(output);
    if (basename(dirname(normalized)) === ".cursor" && basename(normalized) === "rules") return join(output, "project.mdc");
    return join(output, ".cursor", "rules", "project.mdc");
  }
  throw new Error(`Unsupported adapter: ${adapter}`);
}

function mergeWithExisting(target, rendered, force) {
  if (!existsSync(target)) return rendered;
  if (statSync(target).isDirectory()) throw new Error(`Adapter output target is a directory, expected a file path: ${target}`);
  const existing = readFileSync(target, "utf8");
  if (!existing.trim()) return rendered;
  const marker = generatedBlockPattern();
  if (marker.test(existing)) return existing.replace(marker, rendered);
  if (force) return rendered;
  throw new Error(`Refusing to overwrite non-empty adapter file without AI-PROJECT-SKILL-MAKER markers: ${target}. Re-run with --force to replace it.`);
}

const args = parseArgs(process.argv);
if (args.help || !args.input || !args.adapter || !args.output) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const adapter = args.adapter.toLowerCase();
if (!adapters.has(adapter)) {
  console.error(`--adapter must be one of: ${[...adapters].join(", ")}`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(args.input, "utf8"));
const rendered =
  adapter === "agents" ? renderAgents(config) :
  adapter === "claude" ? renderClaude(config) :
  adapter === "copilot" ? renderCopilot(config) :
  renderCursor(config);
const target = outputPath(adapter, args.output);
mkdirSync(dirname(target), { recursive: true });
let output;
try {
  output = mergeWithExisting(target, rendered, args.force);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
writeFileSync(target, output);
console.log(`Rendered ${adapter} adapter to ${target}`);
