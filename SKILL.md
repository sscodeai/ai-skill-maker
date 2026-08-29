---
name: ai-skill-maker
description: Create or refresh reusable AI skills and instruction bundles for coding agents. Use when the user wants to design a new functional skill, document/template skill, workflow automation skill, project maintainer skill, adapter instruction bundle, or refresh an existing AI skill while preserving user-authored rules.
---

# AI Skill Maker

## Purpose

Create reusable AI skills and instruction bundles that future coding agents can use to perform a specific capability, maintain a project, generate an artifact type, automate a workflow, or adapt instructions for assistant platforms. This is a meta-skill: its output is another AI skill or instruction bundle, not ordinary project documentation.

Keep this `SKILL.md` small. Load only the references needed for the requested mode, standards, and output adapters.

## Protected Core (Constitution)

Read `references/rules/protected-core-principles.md` before creating, refreshing, or
auditing any skill. The section between `<!-- PROTECTED_CORE_START -->` and
`<!-- PROTECTED_CORE_END -->` there is the behavior constitution: ordinary
optimization, simplification, refactoring, migration, or wording changes do NOT
authorize deleting, downgrading, moving, merging, renaming, or reordering those
principles. Only when the user explicitly names a core principle in the current
request may it change, and then `scripts/check-core-principles.mjs --fix` must
regenerate `references/rules/core-principles.lock.json`.

Before committing anything that touches `SKILL.md`, this file, or maker
references, run `scripts/check-core-principles.mjs`. It fails loudly when the
protected section drifted from the lock.

## File Budget Guardrail

Active Markdown instruction files (SKILL.md and `references/**`, excluding
README/LICENSE) are subject to a hard ceiling of 9,000 tokens per file,
estimated as UTF-8 bytes / 4. Run `scripts/file-budget.mjs` before committing
maker changes, and run it on generated skills when the output includes many
references. If a generated reference would exceed the ceiling, split it or move
detail into non-Markdown assets; never delete user capabilities to fit.

## Mode Selection

- Use **functional skill mode** when the output skill should perform a reusable capability such as creating presentations, Markdown reports, PDFs, spreadsheets, images, data workflows, or API tasks. Read `references/modes/functional-skill.md` and `references/checklists/functional-skill-intake.md`.
- Use **document/template skill mode** when artifact structure, style, assets, or rendered fidelity are central. Read `references/modes/document-template-skill.md` and `references/checklists/functional-skill-intake.md`.
- Use **workflow automation skill mode** when the skill should run repeatable operational procedures through tools, CLIs, APIs, browser/app automation, or scripts. Read `references/modes/workflow-automation-skill.md` and `references/checklists/functional-skill-intake.md`.
- Use **project maintainer mode** when the output should guide long-term maintenance of a specific software project. Read `references/modes/project-maintainer-skill.md`, then use `references/modes/genesis.md` for intent-first projects or `references/modes/repo.md` for existing repositories.
- Use **adapter instruction bundle mode** when the user wants `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions, or similar assistant files. Read `references/modes/adapter-instruction-bundle.md` and `references/adapters/output-contract.md`.
- Use **refresh workflow** when updating an existing AI skill or instruction bundle. Preserve user-authored rules and read `references/workflows/refresh.md`, `references/checklists/existing-skill-scan.md`, `references/checklists/refresh-skill.md`, `references/output-schema.md`, `references/rules/evidence-vs-recommendation.md`, and the relevant mode file.

If the mode is ambiguous, infer it from available artifacts. Ask only when the choice affects output structure or user intent.

## Core Workflow

1. Establish the language and locale profile for the author, project references, and public expression. Keep core reusable agent instructions in English. Read `references/rules/language-policy.md`.
2. **Settle the root problem first.** Read `references/checklists/functional-skill-intake.md` (Root Problem section) before gathering capability details. State the root problem in one sentence; ask one clarifying question if you cannot. Do not design around the user's first phrasing when it is a symptom.
3. **Run the Trust Gate before generating.** Read `references/checklists/trust-gate.md` and record PASS/BLOCK for permissions, sensitive data, dependencies, environment, external actions, and rollback. One BLOCK stops generation until the root cause is fixed. Do not let prose or a high score compensate for an unsafe permission, leakage, opaque dependency, or unfit environment.
4. Gather evidence and intent.
   - For new functional skills, interview for examples, triggering language, artifacts, reusable resources, validation, and platform targets.
   - For project maintainer outputs, interview or scan the repo according to genesis/repo mode.
5. Separate every claim into one of: observed facts, declared user intent, recommended standards, inferred assumptions. Read `references/rules/evidence-vs-recommendation.md`.
6. Choose applicable standards for the selected skill type, artifact type, workflow, assistant platform, and verification needs.
7. Choose output adapters. Default to a Codex-compatible skill folder or platform-neutral instruction bundle; read adapter references only when requested.
8. Validate durable configs before rendering: use `scripts/validate-skill-config.mjs --strict` for general skills and `scripts/validate-config.mjs --strict` for project maintainer compatibility outputs.
9. Render general skills with `scripts/render-skill.mjs`; use `scripts/render-project-skill.mjs` only for project maintainer compatibility outputs.
10. Validate general skill outputs with `scripts/validate-skill-output.mjs`; validate project maintainer compatibility outputs with `scripts/validate-project-skill.mjs`. Run platform-specific compatibility checks when relevant. If the generated skill includes `references/evals/`, run the release gate (BLOCK/ALLOW) before declaring it ready.
11. Report the final path, generated files, preserved user areas, validation result, trust gate result, and suggested invocation prompt.

For forward-testing this maker itself in a fresh session, read `references/evals/forward-tests.md`.

## Required Output Shape

Read `references/output-schema.md` before rendering. A Codex-compatible generated skill should include at least:

- `SKILL.md`
- `agents/openai.yaml`
- references, assets, and scripts needed for the generated skill's capability
- optional validation or health-check scripts when deterministic behavior matters

Do not stuff detailed domain rules into the generated `SKILL.md`; put durable details in `references/`.

## Config Inputs

Read `references/config-schema.md` first, then `references/skill-config-schema.md` for general skill configs or `references/project-config-schema.md` for project maintainer compatibility configs. Use `assets/examples/functional-skill-config.json` for a general functional skill starter, or the project-maintainer examples for compatibility outputs. Match the validator to the renderer: `validate-skill-output.mjs` for `render-skill.mjs`, and `validate-project-skill.mjs` for `render-project-skill.mjs`.

## Adapters

Default output is platform-neutral AI skill guidance. When the user requests a specific assistant artifact, read the matching adapter:

- `references/adapters/output-contract.md`
- `references/adapters/codex-skill.md`
- `references/adapters/agents-md.md`
- `references/adapters/claude-md.md`
- `references/adapters/cursor-rules.md`
- `references/adapters/copilot-instructions.md`
- `references/evals/forward-tests.md`

Use the shared output contract before emitting adapter-specific files.

## Scripts

- `scripts/collect-repo-signals.mjs <repo>`: collect package, docs, CI, test, script, lockfile, style, and commit signals as JSON.
- `scripts/draft-project-config.mjs --repo <repo>`: draft a repo-mode render config from collected repository signals.
- `scripts/render-adapter.mjs --input config.json --adapter agents|claude|cursor|copilot --output <repo-root-or-file> [--force]`: render platform-specific instruction files while preserving marked generated blocks.
- `scripts/validate-config.mjs --input config.json [--mode genesis|repo] [--strict]`: check config shape, evidence labels, strict-mode coverage, and repo-mode observed fact citations.
- `scripts/validate-skill-config.mjs --input config.json [--mode functional|document|workflow|refresh] [--strict]`: check general skill config shape, required strict fields, trigger metadata, and evidence labels.
- `scripts/render-skill.mjs --input config.json --output <skill-dir> [--template <dir>] [--mode functional|document|workflow|refresh] [--strict]`: render or refresh a general generated skill while preserving manual blocks. Use `--print-schema` to show the general skill config schema.
- `scripts/validate-skill-output.mjs <skill-dir>`: verify required generated skill files, metadata, evidence ledgers, and manual preservation markers.
- `scripts/render-project-skill.mjs --input config.json --output <skill-dir> [--template <dir>] [--mode genesis|repo] [--strict]`: current compatibility renderer for project maintainer skills while general skill rendering is added. Use `--print-schema` to show the project maintainer config schema.
- `scripts/validate-project-skill.mjs <skill-dir>`: current compatibility validator for generated project maintainer skill folders.
- `scripts/self-check.mjs [--check-installed]`: run repository health checks for render, validation, template failure behavior, and optional installed skill sync.
- `scripts/install-local-skill.mjs [--skills-dir <dir>] [--dry-run]`: sync this repository to the local Codex personal skills directory, or preview the install target and payload without writing files.

Read scripts only when debugging or changing behavior; they are designed to run directly.

<!-- BEGIN USER RULES -->
<!-- Add durable skill-specific rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
