#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--signals") args.signals = argv[++i];
    else if (arg === "--repo") args.repo = argv[++i];
    else if (arg === "--project-name") args.projectName = argv[++i];
    else if (arg === "--help") args.help = true;
    else if (!args.repo) args.repo = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/draft-project-config.mjs --repo <repo>
  node scripts/draft-project-config.mjs --signals repo-signals.json
  node scripts/draft-project-config.mjs <repo>`);
}

function slugify(value) {
  return String(value || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "project";
}

function collectSignals(repo) {
  const repoPath = resolve(repo);
  const result = spawnSync(process.execPath, ["scripts/collect-repo-signals.mjs", repoPath], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
  return JSON.parse(result.stdout);
}

function bullet(label, text) {
  return `- ${label}: ${text}`;
}

function observed(path, text) {
  return bullet("observed_fact", `\`${path}\` ${text}`);
}

function lines(items, fallback) {
  const filtered = items.filter(Boolean);
  return filtered.length ? filtered.join("\n") : fallback;
}

function scriptBullets(scripts) {
  return Object.entries(scripts || {}).map(([name, command]) => observed("package.json", `defines \`${name}\` as \`${command}\`.`));
}

function packageManager(signals) {
  if (signals.package?.packageManager) return signals.package.packageManager;
  const locks = signals.files?.lockfiles || [];
  if (locks.includes("pnpm-lock.yaml")) return "pnpm";
  if (locks.includes("yarn.lock")) return "yarn";
  if (locks.some((f) => f.startsWith("bun."))) return "bun";
  if (locks.includes("package-lock.json") || locks.includes("npm-shrinkwrap.json")) return "npm";
  return null;
}

function packageManagerSource(signals) {
  if (signals.package?.packageManager) return "package.json";
  const locks = signals.files?.lockfiles || [];
  if (locks.includes("pnpm-lock.yaml")) return "pnpm-lock.yaml";
  if (locks.includes("yarn.lock")) return "yarn.lock";
  if (locks.some((f) => f.startsWith("bun."))) return locks.find((f) => f.startsWith("bun."));
  if (locks.includes("package-lock.json")) return "package-lock.json";
  if (locks.includes("npm-shrinkwrap.json")) return "npm-shrinkwrap.json";
  return null;
}

const args = parseArgs(process.argv);
if (args.help || (!args.repo && !args.signals)) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const signals = args.signals ? JSON.parse(readFileSync(args.signals, "utf8")) : collectSignals(args.repo);
const repoPath = resolve(signals.repo || args.repo || ".");
const projectName = args.projectName || signals.package?.name || basename(repoPath);
const scripts = signals.package?.scripts || {};
const readmes = signals.files?.readmes || [];
const primaryReadme = readmes.find((file) => /^readme\.md$/i.test(file)) || readmes[0];
const docs = signals.files?.docs || [];
const ci = signals.files?.ci || [];
const configs = signals.files?.configs || [];
const testFiles = signals.files?.testFiles || [];
const typeScriptFiles = signals.files?.typeScriptFiles || [];
const agentInstructionFiles = signals.files?.agentInstructionFiles || [];
const sourceRoots = signals.files?.sourceRoots || [];
const lockfiles = signals.files?.lockfiles || [];
const generatedHints = signals.files?.generatedHints || [];
const pm = signals.tooling?.packageManager || packageManager(signals);
const pmSource = packageManagerSource(signals);
const scriptsByCategory = signals.tooling?.scriptsByCategory || {};
const frameworkVersions = signals.tooling?.frameworkVersions || {};
const docsLanguageHints = signals.tooling?.docsLanguageHints || {};
const frameworkHints = signals.frameworkHints || {};
const standards = [
  frameworkHints.astro || frameworkHints.docsHeavy ? "web docs" : null,
  frameworkHints.typescript || frameworkHints.node ? "TypeScript/Node" : null,
  signals.package?.license ? "OSS maintenance" : null,
].filter(Boolean);

function typeScriptEvidence() {
  if (!frameworkHints.typescript) return null;
  if (configs.includes("tsconfig.json")) return observed("tsconfig.json", "indicates TypeScript is part of the project.");
  if (typeScriptFiles.length) return observed(typeScriptFiles[0], "is a TypeScript source file.");
  return bullet("inferred_assumption", "TypeScript is hinted by tooling, but the exact source file should be confirmed.");
}

function frameworkVersionEvidence() {
  const entries = Object.entries(frameworkVersions);
  if (!entries.length) return null;
  const versions = entries.map(([name, version]) => `\`${name}@${version}\``).join(", ");
  if (signals.package) return observed("package.json", `indicates framework/tool versions: ${versions}.`);
  return bullet("inferred_assumption", `Detected framework/tool versions without a source file citation: ${versions}.`);
}

const config = {
  mode: "repo",
  skillName: `${slugify(projectName)}-maintainer`,
  projectName,
  shortDescription: `Maintain ${projectName}`,
  projectPurpose: lines(
    [
      primaryReadme ? observed(primaryReadme, "is the primary project overview source.") : null,
      signals.package?.name ? observed("package.json", `names the package \`${signals.package.name}\`.`) : null,
      bullet("declared_intent", "Confirm product purpose and non-goals with the maintainer."),
    ],
    bullet("inferred_assumption", "Project purpose needs maintainer confirmation.")
  ),
  audience: lines(
    [
      primaryReadme ? observed(primaryReadme, "is likely written for users or contributors.") : null,
      bullet("inferred_assumption", "Primary audience should be confirmed with the maintainer."),
    ],
    bullet("inferred_assumption", "Audience is not yet known.")
  ),
  publicVoice: lines(
    [
      primaryReadme ? observed(primaryReadme, "provides public tone and terminology signals.") : null,
      bullet("recommended_standard", "Keep public-facing copy concrete and consistent with existing docs."),
    ],
    bullet("inferred_assumption", "Public voice needs maintainer confirmation.")
  ),
  constraints: lines(
    [
      typeScriptEvidence(),
      signals.package?.engines ? observed("package.json", `declares engines ${JSON.stringify(signals.package.engines)}.`) : null,
      signals.package?.license ? observed("package.json", `declares license \`${signals.package.license}\`.`) : null,
      bullet("declared_intent", "Confirm hard technical, legal, hosting, privacy, or dependency constraints."),
    ],
    bullet("inferred_assumption", "Constraints need maintainer confirmation.")
  ),
  maintenanceGoals: bullet("declared_intent", "Confirm maintenance goals after reviewing repo signals."),
  questionsToRevisit: lines(
    [
      ci.length ? null : bullet("inferred_assumption", "Confirm CI expectations because no CI files were detected."),
      Object.keys(scripts).length ? null : bullet("inferred_assumption", "Confirm verification workflow because no package scripts were detected."),
      bullet("inferred_assumption", "Confirm release workflow and public communication policy."),
    ],
    bullet("inferred_assumption", "Confirm future maintenance goals with the maintainer.")
  ),
  importantPaths: lines(
    [
      ...readmes.map((f) => observed(f, "is a README or overview file.")),
      ...sourceRoots.map((f) => observed(f, "is a top-level source/content/public root.")),
      ...testFiles.slice(0, 12).map((f) => observed(f, "is a detected test file.")),
      ...docs.slice(0, 12).map((f) => observed(f, "is a documentation or content path.")),
      ...ci.map((f) => observed(f, "is a CI workflow or pipeline file.")),
      ...agentInstructionFiles.map((f) => observed(f, "is an existing AI assistant instruction file.")),
    ],
    bullet("inferred_assumption", "Important paths should be filled from direct repo inspection.")
  ),
  entryPoints: lines(
    [
      signals.package ? observed("package.json", "defines package metadata, scripts, exports, dependencies, or binary entry points.") : null,
      signals.package?.exports ? observed("package.json", "defines package exports.") : null,
      signals.package?.bin ? observed("package.json", "defines CLI binary entry points.") : null,
      ...configs.slice(0, 12).map((f) => observed(f, "is a detected framework, build, test, lint, or docs config.")),
    ],
    bullet("inferred_assumption", "Entry points should be confirmed by inspecting source files.")
  ),
  ownershipBoundaries: lines(
    [
      generatedHints.length ? bullet("observed_fact", `Generated or edit-careful hints detected: ${generatedHints.slice(0, 12).map((f) => `\`${f}\``).join(", ")}.`) : null,
      bullet("recommended_standard", "Confirm before modifying package exports, generated files, vendored code, release files, or public API surface."),
    ],
    bullet("recommended_standard", "Confirm before editing generated, vendored, release, or public API surface files.")
  ),
  systemShape: lines(
    [
      frameworkHints.astro ? observed("astro.config.*", "or dependencies indicate an Astro project.") : null,
      typeScriptEvidence(),
      frameworkHints.node ? observed("package.json", "indicates a Node/package-managed project.") : null,
      frameworkHints.docsHeavy ? bullet("inferred_assumption", "Docs root, content, or docs framework signals indicate a documentation-heavy project.") : null,
      frameworkHints.hasReadme && !frameworkHints.docsHeavy ? bullet("inferred_assumption", "README signals exist, but docs-heavy project structure was not detected.") : null,
      frameworkVersionEvidence(),
    ],
    bullet("inferred_assumption", "System shape needs direct architecture inspection.")
  ),
  dataFlow: bullet("inferred_assumption", "Data, content, request, or build flow should be confirmed by inspecting source and config files."),
  integrationPoints: lines(
    [
      ...ci.map((f) => observed(f, "is a CI integration point.")),
      signals.package ? observed("package.json", "is a package manager and dependency integration point.") : null,
    ],
    bullet("inferred_assumption", "External integrations should be confirmed with maintainer intent and config inspection.")
  ),
  designConstraints: lines(
    [
      frameworkHints.docsHeavy ? bullet("recommended_standard", "Preserve stable docs URLs and verify navigation/layout changes.") : null,
      frameworkHints.typescript || frameworkHints.node ? bullet("recommended_standard", "Preserve public API compatibility unless a breaking change is intentional.") : null,
    ],
    bullet("recommended_standard", "Prefer focused, reviewable changes that match existing project structure.")
  ),
  stylePatterns: lines(
    [
      sourceRoots.length ? bullet("observed_fact", `${sourceRoots.map((f) => `\`${f}\``).join(", ")} provide local style and organization signals.`) : null,
      bullet("recommended_standard", "Follow existing local patterns before introducing new abstractions."),
    ],
    bullet("recommended_standard", "Follow existing local patterns before introducing new abstractions.")
  ),
  dependencyPolicy: lines(
    [
      signals.package ? observed("package.json", "records dependencies and devDependencies.") : null,
      pm && pmSource ? observed(pmSource, `indicates the package manager appears to be \`${pm}\`.`) : null,
      pm && !pmSource ? bullet("inferred_assumption", `Package manager appears to be \`${pm}\`.`) : null,
      bullet("recommended_standard", "Add dependencies only when they remove real complexity and fit project policy."),
    ],
    bullet("recommended_standard", "Confirm dependency policy with the maintainer.")
  ),
  patternsToAvoid: "- recommended_standard: Avoid unrelated refactors, broad dependency churn, public API changes, and generated-file edits during focused maintenance.",
  languagePolicy: lines(
    [
      primaryReadme ? observed(primaryReadme, "provides language and terminology signals.") : null,
      Object.values(docsLanguageHints).some(Boolean) ? bullet("inferred_assumption", `Documentation language hints from scanned docs: ${Object.entries(docsLanguageHints).filter(([, value]) => value).map(([name]) => name).join(", ")}.`) : null,
      bullet("declared_intent", "Confirm author comfort language, country/region context, and target audience locale."),
    ],
    bullet("declared_intent", "Confirm language and locale profile with the maintainer.")
  ),
  toneAndNaming: lines(
    [
      primaryReadme ? observed(primaryReadme, "provides naming and terminology signals.") : null,
      bullet("recommended_standard", "Reuse existing names for public concepts."),
    ],
    bullet("recommended_standard", "Reuse established names and terminology.")
  ),
  documentationConventions: lines(
    [
      docs.length ? bullet("observed_fact", `${docs.slice(0, 12).map((f) => `\`${f}\``).join(", ")} provide documentation structure signals.`) : null,
      bullet("recommended_standard", "Update docs and examples when public behavior changes."),
    ],
    bullet("recommended_standard", "Update docs and examples when public behavior changes.")
  ),
  commonChangeFlow: "- recommended_standard: Inspect relevant files, make a focused change, run targeted verification, then broaden checks when risk warrants.",
  firstRepositoryTasks: "- inferred_assumption: Not applicable for an existing repo; replace with current maintenance backlog after maintainer interview.",
  reviewFlow: "- recommended_standard: Review behavior, tests, docs, generated files, dependency impact, and release impact.",
  verificationCommands: lines(
    [
      ...scriptBullets(scripts),
      scriptsByCategory.test?.length ? bullet("observed_fact", `Test scripts detected: ${scriptsByCategory.test.map((name) => `\`${name}\``).join(", ")}.`) : null,
      scriptsByCategory.build?.length ? bullet("observed_fact", `Build scripts detected: ${scriptsByCategory.build.map((name) => `\`${name}\``).join(", ")}.`) : null,
      scriptsByCategory.lint?.length ? bullet("observed_fact", `Lint scripts detected: ${scriptsByCategory.lint.map((name) => `\`${name}\``).join(", ")}.`) : null,
      scriptsByCategory.typecheck?.length ? bullet("observed_fact", `Typecheck scripts detected: ${scriptsByCategory.typecheck.map((name) => `\`${name}\``).join(", ")}.`) : null,
      Object.keys(scripts).length ? bullet("recommended_standard", "Use exact package scripts as the source of truth for available checks.") : null,
    ],
    bullet("inferred_assumption", "Verification commands need maintainer confirmation because no package scripts were detected.")
  ),
  manualQa: "- recommended_standard: For user-facing, docs, CLI, or package behavior changes, run a small manual scenario or preview when possible.",
  riskGates: "- recommended_standard: Escalate public API, release, generated-file, security-sensitive, and broad dependency changes.",
  versioning: "- inferred_assumption: Versioning policy should be confirmed from release docs, tags, package metadata, or maintainer intent.",
  changelog: lines(
    [
      existsSync(resolve(repoPath, "CHANGELOG.md")) ? observed("CHANGELOG.md", "is present and should be treated as the changelog source.") : null,
      bullet("recommended_standard", "Record user-visible behavior changes before release."),
    ],
    bullet("inferred_assumption", "Changelog policy needs confirmation.")
  ),
  deployPublish: lines(
    [
      ci.length ? bullet("observed_fact", `${ci.map((f) => `\`${f}\``).join(", ")} may contain deploy or publish automation.`) : null,
      scripts.release ? observed("package.json", "defines a `release` script.") : null,
    ],
    bullet("inferred_assumption", "Deploy or publish workflow needs confirmation.")
  ),
  rollback: "- recommended_standard: Prefer revertable changes and document rollback for deploy, publish, or release workflow edits.",
  generatedOutput: lines(
    generatedHints.map((f) => observed(f, "is a generated, snapshot, schema, vendored, lock, or edit-careful hint.")),
    bullet("inferred_assumption", "Generated output paths should be confirmed from build config and repo conventions.")
  ),
  lockfiles: lines(
    lockfiles.map((f) => observed(f, "is a package lockfile.")),
    bullet("inferred_assumption", "Lockfile policy should follow the selected package manager.")
  ),
  snapshotsSchemasVendored: lines(
    generatedHints.filter((f) => /snapshot|schema|vendor|vendored/i.test(f)).map((f) => observed(f, "is a snapshot, schema, or vendored-file hint.")),
    bullet("inferred_assumption", "Snapshots, schemas, and vendored files should be confirmed by repo inspection.")
  ),
  editRestrictions: "- recommended_standard: Confirm before modifying generated, vendored, release, lockfile, or public API surface files.",
  evidenceLedger: lines(
    [
      primaryReadme ? observed(primaryReadme, "was detected as a README source.") : null,
      signals.package ? observed("package.json", "was detected as package metadata.") : null,
      ci.length ? bullet("observed_fact", `CI files detected: ${ci.map((f) => `\`${f}\``).join(", ")}.`) : null,
      agentInstructionFiles.length ? bullet("observed_fact", `Existing assistant instruction files detected: ${agentInstructionFiles.map((f) => `\`${f}\``).join(", ")}.`) : null,
      standards.length ? bullet("recommended_standard", `${standards.join(", ")} standards appear applicable from repo signals.`) : null,
      bullet("declared_intent", "Maintainer goals, constraints, and public voice still need interview confirmation."),
      bullet("inferred_assumption", "This config is a draft from repo signals and should be refined by direct file inspection."),
    ],
    bullet("inferred_assumption", "Evidence ledger should be refined after repo scan.")
  ),
};

console.log(JSON.stringify(config, null, 2));
