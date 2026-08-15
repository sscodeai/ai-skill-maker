#!/usr/bin/env node
import { mkdtempSync, mkdirSync, rmSync, readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const checkInstalled = process.argv.includes("--check-installed");
const skillPayload = ["SKILL.md", "agents", "references", "assets", "scripts"];

function run(args, options = {}) {
  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    ...options,
  });
  return result;
}

function runScriptFrom(cwd, args) {
  return spawnSync(process.execPath, [join(repoRoot, args[0]), ...args.slice(1)], {
    cwd,
    encoding: "utf8",
  });
}

function assertOk(label, result) {
  if (result.status !== 0) {
    console.error(`FAIL ${label}`);
    if (result.stdout) console.error(result.stdout.trim());
    if (result.stderr) console.error(result.stderr.trim());
    process.exit(result.status || 1);
  }
  console.log(`OK ${label}`);
}

function assertFailIncludes(label, result, text) {
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status === 0 || !output.includes(text)) {
    console.error(`FAIL ${label}`);
    console.error(output.trim());
    process.exit(1);
  }
  console.log(`OK ${label}`);
}

function assertFileIncludes(label, path, text) {
  const content = readFileSync(path, "utf8");
  if (!content.includes(text)) {
    console.error(`FAIL ${label}`);
    console.error(`${path} does not include expected text`);
    process.exit(1);
  }
  console.log(`OK ${label}`);
}

function assertFileNotExists(label, path) {
  if (existsSync(path)) {
    console.error(`FAIL ${label}`);
    console.error(`${path} should not exist`);
    process.exit(1);
  }
  console.log(`OK ${label}`);
}

function listFiles(dir, root = dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === ".git") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listFiles(full, root, out);
    else out.push(relative(root, full));
  }
  return out;
}

function listPayloadFiles(root) {
  const files = [];
  for (const name of skillPayload) {
    const full = join(root, name);
    if (!existsSync(full)) continue;
    if (statSync(full).isDirectory()) listFiles(full, root, files);
    else files.push(name);
  }
  return files.sort();
}

function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function fileHashMap(root) {
  return new Map(listPayloadFiles(root).map((file) => [file, hashFile(join(root, file))]));
}

const temp = mkdtempSync(join(tmpdir(), "ai-skill-maker-self-check-"));

try {
  assertOk("collect repo signals", run(["scripts/collect-repo-signals.mjs", "."]));
  const signals = run(["scripts/collect-repo-signals.mjs", "."]);
  assertOk("collect enriched repo signals", signals);
  const parsedSignals = JSON.parse(signals.stdout);
  if (
    !parsedSignals.tooling?.scriptsByCategory ||
    !parsedSignals.files?.agentInstructionFiles ||
    !parsedSignals.files?.testFiles ||
    !parsedSignals.files?.typeScriptFiles ||
    !parsedSignals.files?.skippedDirs ||
    typeof parsedSignals.frameworkHints?.hasReadme !== "boolean" ||
    typeof parsedSignals.frameworkHints?.docsHeavy !== "boolean"
  ) {
    console.error("FAIL enriched repo signals shape");
    process.exit(1);
  }
  console.log("OK enriched repo signals shape");
  assertOk("print schema", run(["scripts/render-project-skill.mjs", "--print-schema"]));
  const functionalConfigPath = join(temp, "functional-skill-config.json");
  const functionalOutDir = join(temp, "functional-skill");
  for (const mode of ["functional", "document", "workflow", "refresh"]) {
    const config = run(["scripts/render-skill.mjs", "--init-config", mode]);
    assertOk(`init ${mode} skill config`, config);
    JSON.parse(config.stdout);
    const configPath = mode === "functional" ? functionalConfigPath : join(temp, `${mode}-skill-config.json`);
    writeFileSync(configPath, config.stdout);
    assertOk(`validate ${mode} skill config strict`, run(["scripts/validate-skill-config.mjs", "--input", configPath, "--strict"]));
    const outDir = mode === "functional" ? functionalOutDir : join(temp, `${mode}-skill`);
    assertOk(`render ${mode} skill`, run(["scripts/render-skill.mjs", "--input", configPath, "--output", outDir, "--strict"]));
    assertOk(`validate ${mode} skill`, run(["scripts/validate-skill-output.mjs", outDir]));
  }
  const emptySkillConfigPath = join(temp, "empty-skill-config.json");
  writeFileSync(emptySkillConfigPath, "{}");
  assertFailIncludes("empty skill config fails strict", run(["scripts/validate-skill-config.mjs", "--input", emptySkillConfigPath, "--strict"]), "skillName is required");
  assertFailIncludes("render skill strict rejects empty config", run(["scripts/render-skill.mjs", "--input", emptySkillConfigPath, "--output", join(temp, "empty-skill"), "--strict"]), "Skill config validation failed");
  const yamlSkillConfigPath = join(temp, "yaml-skill-config.json");
  const yamlSkillConfig = JSON.parse(readFileSync(functionalConfigPath, "utf8"));
  yamlSkillConfig.skillDescription = "Create: reports for users";
  writeFileSync(yamlSkillConfigPath, JSON.stringify(yamlSkillConfig, null, 2));
  const yamlSkillOutDir = join(temp, "yaml-skill");
  assertOk("render yaml-safe skill description", run(["scripts/render-skill.mjs", "--input", yamlSkillConfigPath, "--output", yamlSkillOutDir, "--strict"]));
  assertFileIncludes("yaml-safe skill description quoted", join(yamlSkillOutDir, "SKILL.md"), 'description: "Create: reports for users"');
  assertOk("validate yaml-safe skill", run(["scripts/validate-skill-output.mjs", yamlSkillOutDir]));
  const functionalIntentPath = join(functionalOutDir, "references", "skill-intent.md");
  const functionalKeep = "- declared_intent: Preserve this functional skill user rule.";
  const functionalIntent = readFileSync(functionalIntentPath, "utf8");
  writeFileSync(
    functionalIntentPath,
    functionalIntent.replace(
      "<!-- BEGIN USER RULES -->\n<!-- Add durable skill-specific rules here. This block is preserved on refresh. -->\n<!-- END USER RULES -->",
      `<!-- BEGIN USER RULES -->\n${functionalKeep}\n<!-- END USER RULES -->`
    )
  );
  assertOk("refresh functional skill", run(["scripts/render-skill.mjs", "--input", functionalConfigPath, "--output", functionalOutDir, "--strict"]));
  assertFileIncludes("functional skill preserves user rules", functionalIntentPath, functionalKeep);
  assertOk("validate refreshed functional skill", run(["scripts/validate-skill-output.mjs", functionalOutDir]));
  assertOk("validate genesis config strict", run(["scripts/validate-config.mjs", "--input", "assets/examples/genesis-config.json", "--mode", "genesis", "--strict"]));
  assertOk("validate repo config strict", run(["scripts/validate-config.mjs", "--input", "assets/examples/repo-config.json", "--mode", "repo", "--strict"]));
  const invalidConfigPath = join(temp, "invalid-config.json");
  writeFileSync(invalidConfigPath, "{}");
  assertFailIncludes("invalid config fails clearly", run(["scripts/validate-config.mjs", "--input", invalidConfigPath, "--strict"]), "projectName is required");
  const nullConfigPath = join(temp, "null-config.json");
  writeFileSync(nullConfigPath, "null");
  assertFailIncludes("null config fails clearly", run(["scripts/validate-config.mjs", "--input", nullConfigPath, "--strict"]), "Config must be a JSON object");
  const weakCitationConfigPath = join(temp, "weak-citation-config.json");
  const weakCitationConfig = {
    projectName: "Weak Citation",
    projectPurpose: "- observed_fact: `notapath` claims a fact.",
    audience: "- declared_intent: Confirm audience.",
    constraints: "- declared_intent: Confirm constraints.",
    maintenanceGoals: "- declared_intent: Confirm maintenance goals.",
    importantPaths: "- observed_fact: `README.md` is a source file.",
    entryPoints: "- observed_fact: `package.json` is a source file.",
    systemShape: "- observed_fact: `src/` is a source root.",
    stylePatterns: "- recommended_standard: Follow existing style.",
    verificationCommands: "- recommended_standard: Run available checks.",
    generatedOutput: "- recommended_standard: Avoid generated output.",
    editRestrictions: "- recommended_standard: Confirm before generated-file edits.",
    evidenceLedger: "- observed_fact: `notapath` is not a valid path citation.\n- declared_intent: Confirm maintainer intent.",
  };
  writeFileSync(weakCitationConfigPath, JSON.stringify(weakCitationConfig, null, 2));
  assertFailIncludes("weak observed citation fails clearly", run(["scripts/validate-config.mjs", "--input", weakCitationConfigPath, "--mode", "repo", "--strict"]), "should cite a source path");
  const draftedConfig = run(["scripts/draft-project-config.mjs", "--repo", "."]);
  assertOk("draft repo config", draftedConfig);
  JSON.parse(draftedConfig.stdout);
  const adapterConfigPath = join(temp, "adapter-config.json");
  writeFileSync(adapterConfigPath, draftedConfig.stdout);
  assertOk("draft repo config validates strict", run(["scripts/validate-config.mjs", "--input", adapterConfigPath, "--mode", "repo", "--strict"]));
  for (const adapter of ["agents", "claude", "cursor", "copilot"]) {
    assertOk(`render ${adapter} adapter`, run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", adapter, "--output", join(temp, "adapters")]));
  }
  const agentsPath = join(temp, "adapters", "AGENTS.md");
  const existingAgents = readFileSync(agentsPath, "utf8");
  const keepText = "USER KEEP: adapter refresh should preserve this section.";
  writeFileSync(agentsPath, `${existingAgents}\n${keepText}\n`);
  assertOk("refresh agents adapter preserves user text", run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", "agents", "--output", join(temp, "adapters")]));
  assertFileIncludes("agents adapter kept user text", agentsPath, keepText);
  const unsafeAdapterPath = join(temp, "unsafe", "AGENTS.md");
  mkdirSync(dirname(unsafeAdapterPath), { recursive: true });
  writeFileSync(unsafeAdapterPath, "Existing human instructions without maker markers.\n");
  assertFailIncludes("adapter refuses unsafe overwrite", run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", "agents", "--output", join(temp, "unsafe")]), "--force");
  assertOk("adapter force overwrite", run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", "agents", "--output", join(temp, "unsafe"), "--force"]));
  const cursorRulesDir = join(temp, "cursor-direct", ".cursor", "rules");
  assertOk("render cursor adapter to rules dir", run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", "cursor", "--output", cursorRulesDir]));
  assertFileIncludes("cursor adapter direct path exists", join(cursorRulesDir, "project.mdc"), "alwaysApply: true");
  assertFileNotExists("cursor adapter avoids nested rules dir", join(cursorRulesDir, ".cursor", "rules", "project.mdc"));
  const cursorPath = join(temp, "adapters", ".cursor", "rules", "project.mdc");
  const cursorFirst = readFileSync(cursorPath, "utf8");
  writeFileSync(cursorPath, `${cursorFirst}\n${keepText}\n`);
  assertOk("refresh cursor adapter preserves user text", run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", "cursor", "--output", join(temp, "adapters")]));
  const cursorSecond = readFileSync(cursorPath, "utf8");
  const cursorFrontmatterCount = (cursorSecond.match(/^---$/gm) || []).length;
  if (cursorFrontmatterCount !== 2) {
    console.error("FAIL cursor adapter refresh does not duplicate frontmatter");
    console.error(`Expected 2 frontmatter delimiters, got ${cursorFrontmatterCount}`);
    process.exit(1);
  }
  console.log("OK cursor adapter refresh does not duplicate frontmatter");
  assertFileIncludes("cursor adapter kept user text", cursorPath, keepText);
  const githubDir = join(temp, "github-direct", ".github");
  assertOk("render copilot adapter to .github dir", run(["scripts/render-adapter.mjs", "--input", adapterConfigPath, "--adapter", "copilot", "--output", githubDir]));
  assertFileIncludes("copilot adapter direct path exists", join(githubDir, "copilot-instructions.md"), "Copilot Instructions");
  assertFileNotExists("copilot adapter avoids nested .github dir", join(githubDir, ".github", "copilot-instructions.md"));

  const tsOnlyRepo = join(temp, "ts-only-repo");
  mkdirSync(join(tsOnlyRepo, "src"), { recursive: true });
  writeFileSync(join(tsOnlyRepo, "src", "index.ts"), "export const value: number = 1;\n");
  const tsOnlyConfig = run(["scripts/draft-project-config.mjs", "--repo", tsOnlyRepo]);
  assertOk("draft ts-only repo config", tsOnlyConfig);
  const tsOnlyConfigPath = join(temp, "ts-only-config.json");
  writeFileSync(tsOnlyConfigPath, tsOnlyConfig.stdout);
  assertFileIncludes("ts-only draft cites actual ts file", tsOnlyConfigPath, "`src/index.ts`");
  const tsOnlyText = readFileSync(tsOnlyConfigPath, "utf8");
  if (tsOnlyText.includes("`tsconfig.json`")) {
    console.error("FAIL ts-only draft does not cite missing tsconfig");
    process.exit(1);
  }
  console.log("OK ts-only draft does not cite missing tsconfig");
  assertOk("ts-only draft validates strict", run(["scripts/validate-config.mjs", "--input", tsOnlyConfigPath, "--mode", "repo", "--strict"]));

  const relativeRepo = join(temp, "relative-repo");
  mkdirSync(join(relativeRepo, "src"), { recursive: true });
  writeFileSync(join(relativeRepo, "package.json"), JSON.stringify({
    name: "relative-target",
    scripts: { build: "tsc" },
    devDependencies: { typescript: "^5.5.0" },
  }, null, 2));
  writeFileSync(join(relativeRepo, "src", "index.ts"), "export const value: number = 1;\n");
  const relativeDraft = runScriptFrom(relativeRepo, ["scripts/draft-project-config.mjs", "--repo", "."]);
  assertOk("draft relative repo path", relativeDraft);
  const relativeConfigPath = join(temp, "relative-config.json");
  writeFileSync(relativeConfigPath, relativeDraft.stdout);
  assertFileIncludes("relative draft uses target package", relativeConfigPath, "\"projectName\": \"relative-target\"");
  assertFileIncludes("relative draft cites package versions", relativeConfigPath, "`package.json` indicates framework/tool versions");
  assertOk("relative draft validates strict", run(["scripts/validate-config.mjs", "--input", relativeConfigPath, "--mode", "repo", "--strict"]));

  const rawTemplate = run(["scripts/validate-project-skill.mjs", "assets/templates/project-skill"]);
  assertFailIncludes("raw template validation fails clearly", rawTemplate, "Render it first");

  for (const mode of ["genesis", "repo"]) {
    const configPath = join(temp, `${mode}.json`);
    const config = run(["scripts/render-project-skill.mjs", "--init-config", mode]);
    assertOk(`init ${mode} config`, config);
    JSON.parse(config.stdout);
    writeFileSync(configPath, config.stdout);
    const outDir = join(temp, `${mode}-maintainer`);
    assertOk(`render ${mode} output`, run(["scripts/render-project-skill.mjs", "--input", configPath, "--output", outDir, "--strict"]));
    assertOk(`validate ${mode} output`, run(["scripts/validate-project-skill.mjs", outDir]));
  }

  const refreshConfigPath = join(temp, "refresh.json");
  const refreshConfig = run(["scripts/render-project-skill.mjs", "--init-config", "genesis"]);
  assertOk("init refresh config", refreshConfig);
  writeFileSync(refreshConfigPath, refreshConfig.stdout);
  const refreshOutDir = join(temp, "refresh-maintainer");
  const preservedRule = "- declared_intent: Preserve this self-check user rule.";
  const intentPath = join(refreshOutDir, "references", "project-intent.md");
  assertOk("render refresh output first pass", run(["scripts/render-project-skill.mjs", "--input", refreshConfigPath, "--output", refreshOutDir]));
  const intent = readFileSync(intentPath, "utf8");
  writeFileSync(
    intentPath,
    intent.replace(
      "<!-- BEGIN USER RULES -->\n<!-- Add durable project-specific rules here. This block is preserved on refresh. -->\n<!-- END USER RULES -->",
      `<!-- BEGIN USER RULES -->\n${preservedRule}\n<!-- END USER RULES -->`
    )
  );
  assertOk("render refresh output second pass", run(["scripts/render-project-skill.mjs", "--input", refreshConfigPath, "--output", refreshOutDir]));
  assertFileIncludes("refresh preserves user rules", intentPath, preservedRule);
  assertOk("validate refresh output", run(["scripts/validate-project-skill.mjs", refreshOutDir]));

  const skill = readFileSync(join(repoRoot, "SKILL.md"), "utf8");
  if (!skill.includes("## Mode Selection") || !skill.includes("## Core Workflow")) {
    console.error("FAIL SKILL.md workflow sections");
    process.exit(1);
  }
  console.log("OK SKILL.md workflow sections");
  assertFileIncludes("SKILL.md routes general validator", join(repoRoot, "SKILL.md"), "Validate general skill outputs with `scripts/validate-skill-output.mjs`");
  assertFileIncludes("SKILL.md routes project validator", join(repoRoot, "SKILL.md"), "validate project maintainer compatibility outputs with `scripts/validate-project-skill.mjs`");
  assertFileIncludes("SKILL.md has ai-skill-maker name", join(repoRoot, "SKILL.md"), "name: ai-skill-maker");
  assertFileIncludes("openai metadata uses ai-skill-maker", join(repoRoot, "agents", "openai.yaml"), "Use $ai-skill-maker");
  assertFileIncludes("SKILL.md links validate-skill-config", join(repoRoot, "SKILL.md"), "scripts/validate-skill-config.mjs");
  assertFileIncludes("SKILL.md links skill config schema", join(repoRoot, "SKILL.md"), "references/skill-config-schema.md");
  assertFileIncludes("SKILL.md links project config schema", join(repoRoot, "SKILL.md"), "references/project-config-schema.md");
  assertFileIncludes("config schema points to skill schema", join(repoRoot, "references", "config-schema.md"), "references/skill-config-schema.md");
  assertFileIncludes("config schema points to project schema", join(repoRoot, "references", "config-schema.md"), "references/project-config-schema.md");
  assertFileIncludes("SKILL.md links render-skill", join(repoRoot, "SKILL.md"), "scripts/render-skill.mjs");
  for (const checklist of ["functional-skill-intake.md", "existing-skill-scan.md", "refresh-skill.md"]) {
    assertFileIncludes(`SKILL.md links ${checklist}`, join(repoRoot, "SKILL.md"), `references/checklists/${checklist}`);
    assertFileIncludes(`checklist exists ${checklist}`, join(repoRoot, "references", "checklists", checklist), "# ");
  }
  for (const modeFile of [
    "functional-skill.md",
    "document-template-skill.md",
    "workflow-automation-skill.md",
    "project-maintainer-skill.md",
    "adapter-instruction-bundle.md",
  ]) {
    assertFileIncludes(`SKILL.md links ${modeFile}`, join(repoRoot, "SKILL.md"), `references/modes/${modeFile}`);
    assertFileIncludes(`mode file exists ${modeFile}`, join(repoRoot, "references", "modes", modeFile), "# ");
  }
  assertFileIncludes("SKILL.md links forward tests", join(repoRoot, "SKILL.md"), "references/evals/forward-tests.md");
  assertFileIncludes("forward tests include functional prompt", join(repoRoot, "references", "evals", "forward-tests.md"), "## Functional Skill Prompt");
  assertFileIncludes("forward tests include document prompt", join(repoRoot, "references", "evals", "forward-tests.md"), "## Document Skill Prompt");
  assertFileIncludes("forward tests include workflow prompt", join(repoRoot, "references", "evals", "forward-tests.md"), "## Workflow Skill Prompt");
  assertFileIncludes("forward tests include existing skill refresh prompt", join(repoRoot, "references", "evals", "forward-tests.md"), "## Existing Skill Refresh Prompt");

  const installed = process.env.HOME ? join(process.env.HOME, ".codex", "skills", "ai-skill-maker") : null;
  if (checkInstalled && installed && existsSync(installed)) {
    const repoFiles = fileHashMap(repoRoot);
    const installedFiles = fileHashMap(installed);
    const forbidden = ["README.md", "README.ja.md", "LICENSE"].filter((file) => existsSync(join(installed, file)));
    const missing = [...repoFiles.keys()].filter((file) => !installedFiles.has(file));
    const extra = [...installedFiles.keys()].filter((file) => !repoFiles.has(file));
    const changed = [...repoFiles.keys()].filter((file) => installedFiles.has(file) && installedFiles.get(file) !== repoFiles.get(file));
    if (missing.length || extra.length || changed.length || forbidden.length) {
      console.error("FAIL installed skill differs from repo");
      for (const [label, files] of [["missing", missing], ["extra", extra], ["changed", changed]]) {
        for (const file of files.slice(0, 8)) console.error(`- ${label}: ${file}`);
        if (files.length > 8) console.error(`- ${label}: ...and ${files.length - 8} more`);
      }
      for (const file of forbidden) console.error(`- forbidden repo doc in installed skill: ${file}`);
      process.exit(1);
    }
    console.log("OK installed skill payload matches repo");
  } else if (checkInstalled) {
    console.log("SKIP installed skill check");
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
