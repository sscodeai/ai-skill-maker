#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const repo = process.argv[2] || process.cwd();
const skippedDirNames = new Set([".git", "node_modules", "dist", "build", ".astro", ".next", "coverage"]);
const generatedDirNames = new Set(["dist", "build", ".astro", ".next", "coverage"]);

function rel(path) {
  return relative(repo, path) || ".";
}

function safeJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function exists(path) {
  return existsSync(join(repo, path));
}

function walk(dir, maxDepth = 4, depth = 0, out = { files: [], skippedDirs: [] }) {
  if (depth > maxDepth || !existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory() && skippedDirNames.has(name)) {
      out.skippedDirs.push(`${rel(full)}/`);
      continue;
    }
    if (s.isDirectory()) walk(full, maxDepth, depth + 1, out);
    else out.files.push(rel(full));
  }
  return out;
}

function git(args) {
  const result = spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}

function dependencyVersion(pkg, name) {
  return pkg?.dependencies?.[name] || pkg?.devDependencies?.[name] || null;
}

function packageManager(pkg, lockfiles) {
  if (pkg?.packageManager) return pkg.packageManager;
  if (lockfiles.includes("pnpm-lock.yaml")) return "pnpm";
  if (lockfiles.includes("yarn.lock")) return "yarn";
  if (lockfiles.some((f) => f.startsWith("bun."))) return "bun";
  if (lockfiles.includes("package-lock.json") || lockfiles.includes("npm-shrinkwrap.json")) return "npm";
  return null;
}

function scriptsByCategory(scripts = {}) {
  const categories = {
    build: [],
    lint: [],
    typecheck: [],
    test: [],
    docs: [],
    preview: [],
    dev: [],
    release: [],
    format: [],
    other: [],
  };
  for (const name of Object.keys(scripts)) {
    const lower = name.toLowerCase();
    if (/build|compile|bundle/.test(lower)) categories.build.push(name);
    else if (/lint/.test(lower)) categories.lint.push(name);
    else if (/type|tsc|check/.test(lower)) categories.typecheck.push(name);
    else if (/test|spec|e2e|unit|integration/.test(lower)) categories.test.push(name);
    else if (/docs|doc|storybook/.test(lower)) categories.docs.push(name);
    else if (/preview|serve/.test(lower)) categories.preview.push(name);
    else if (/dev|start|watch/.test(lower)) categories.dev.push(name);
    else if (/release|publish|changeset|version/.test(lower)) categories.release.push(name);
    else if (/format|fmt|prettier|biome/.test(lower)) categories.format.push(name);
    else categories.other.push(name);
  }
  return categories;
}

function docsLanguageHints(files) {
  const names = files.map((f) => f.toLowerCase());
  return {
    english: names.some((f) => /(^|\/)(readme|docs|index)\.md$/.test(f) || /\.en\./.test(f)),
    japanese: names.some((f) => /\.ja\./.test(f) || /(^|\/)(ja|ja-jp)\//.test(f)),
    simplifiedChinese: names.some((f) => /\.zh(-cn)?\./.test(f) || /(^|\/)(zh|zh-cn|cn)\//.test(f)),
    traditionalChinese: names.some((f) => /\.zh-(tw|hk)\./.test(f) || /(^|\/)(zh-tw|zh-hk)\//.test(f)),
  };
}

const walked = walk(repo, 5);
const files = walked.files.sort();
const skippedDirs = walked.skippedDirs.sort();
const pkg = exists("package.json") ? safeJson(join(repo, "package.json")) : null;
const lockfiles = ["package-lock.json", "npm-shrinkwrap.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock"].filter(exists);
const readmes = files.filter((f) => /^readme(\.|$)/i.test(f));
const docs = files.filter((f) => /^(docs|documentation)\//i.test(f) || /^src\/content\//i.test(f)).slice(0, 80);
const skillFiles = files.filter((f) =>
  f === "SKILL.md" ||
  f === "agents/openai.yaml" ||
  /^references\/.+\.md$/i.test(f) ||
  /^assets\/(examples|templates)\//i.test(f)
).slice(0, 120);
const scriptFiles = files.filter((f) => /^scripts\/.+\.(mjs|js|ts)$/i.test(f)).slice(0, 120);
const ci = files.filter((f) => /^\.github\/workflows\//.test(f) || /(^|\/)(circleci|gitlab-ci|buildkite|azure-pipelines)/i.test(f));
const testFiles = files.filter((f) =>
  /(^|\/)(__tests__|tests?|spec|e2e)\//i.test(f) ||
  /\.(test|spec|e2e)\.[cm]?[jt]sx?$/.test(f) ||
  /\.(test|spec)\.mjs$/.test(f)
).slice(0, 120);
const typeScriptFiles = files.filter((f) => /\.[cm]?tsx?$/.test(f) && !/\.d\.ts$/.test(f)).slice(0, 120);
const configs = files.filter((f) =>
  /(^|\/)(astro|vite|next|nuxt|tsconfig|eslint|prettier|biome|vitest|jest|playwright|rollup|tsup|unbuild|changeset|release-it|semantic-release|typedoc|docusaurus|starlight)/i.test(f)
).slice(0, 120);
const agentInstructionFiles = files.filter((f) =>
  /(^|\/)(AGENTS\.md|CLAUDE\.md|GEMINI\.md|\.cursorrules)$/i.test(f) ||
  /^\.cursor\/rules\//.test(f) ||
  /^\.github\/copilot-instructions\.md$/i.test(f)
).slice(0, 80);
const sourceRoots = ["src", "app", "packages", "lib", "bin", "cli", "content", "public", "references", "agents", "assets", "scripts"].filter(exists);
const generatedHints = files.filter((f) =>
  /(^|\/)(dist|build|coverage|generated|__snapshots__|snapshots|schema|schemas|vendor|vendored)\//i.test(f) ||
  /\.(snap|lock|generated\.[cm]?[jt]s|d\.ts)$/.test(f)
);
const skippedGeneratedDirs = skippedDirs.filter((f) => {
  const name = f.replace(/\/$/, "").split("/").pop();
  return generatedDirNames.has(name);
});
const generatedAndSkippedHints = [...new Set([...generatedHints, ...skippedGeneratedDirs])].slice(0, 120);
const hasDocsRoot = docs.some((f) => /^(docs|documentation)\//i.test(f) || /^src\/content\//i.test(f));
const hasDocsFramework = Boolean(
  exists("astro.config.mjs") ||
    exists("astro.config.ts") ||
    exists("docusaurus.config.js") ||
    exists("docusaurus.config.ts") ||
    dependencyVersion(pkg, "@astrojs/starlight") ||
    dependencyVersion(pkg, "@docusaurus/core")
);

const recentCommits = git(["log", "--oneline", "-n", "12"]).split("\n").filter(Boolean);
const scripts = pkg?.scripts || {};
const frameworkVersions = pkg
  ? Object.fromEntries(
      ["astro", "@astrojs/starlight", "vite", "next", "nuxt", "typescript", "vitest", "jest", "@playwright/test", "eslint", "prettier", "biome"].flatMap((name) => {
        const version = dependencyVersion(pkg, name);
        return version ? [[name, version]] : [];
      })
    )
  : {};

const signals = {
  repo,
  collectedAt: new Date().toISOString(),
  files: {
    readmes,
    docs,
    skillFiles,
    scriptFiles,
    ci,
    configs,
    testFiles,
    typeScriptFiles,
    agentInstructionFiles,
    sourceRoots,
    lockfiles,
    skippedDirs,
    generatedHints: generatedAndSkippedHints,
  },
  tooling: {
    packageManager: packageManager(pkg, lockfiles),
    scriptsByCategory: scriptsByCategory(scripts),
    frameworkVersions,
    docsLanguageHints: docsLanguageHints([...readmes, ...docs]),
  },
  package: pkg
    ? {
        name: pkg.name,
        type: pkg.type,
        packageManager: pkg.packageManager,
        engines: pkg.engines,
        scripts,
        dependencies: Object.keys(pkg.dependencies || {}),
        devDependencies: Object.keys(pkg.devDependencies || {}),
        exports: pkg.exports,
        bin: pkg.bin,
        license: pkg.license,
      }
    : null,
  frameworkHints: {
    astro: exists("astro.config.mjs") || exists("astro.config.ts") || Boolean(pkg?.dependencies?.astro || pkg?.devDependencies?.astro),
    typescript: typeScriptFiles.length > 0 || exists("tsconfig.json"),
    node: Boolean(pkg),
    hasReadme: readmes.length > 0,
    docsHeavy: docs.length >= 3 || hasDocsRoot || hasDocsFramework,
    skillRepo: exists("SKILL.md") && exists("agents/openai.yaml"),
  },
  recentCommits,
};

console.log(JSON.stringify(signals, null, 2));
