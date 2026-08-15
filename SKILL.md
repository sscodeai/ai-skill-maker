---
name: ai-skill-maker
description: Create or refresh reusable AI skills and instruction bundles for coding agents. Use when the user wants to design a new functional skill, document/template skill, workflow automation skill, project maintainer skill, adapter instruction bundle, or refresh an existing AI skill while preserving user-authored rules.
---

# AI Skill Maker

## Purpose

Create reusable AI skills and instruction bundles that future coding agents can use to perform a specific capability, maintain a project, generate an artifact type, automate a workflow, or adapt instructions for assistant platforms. This is a meta-skill: its output is another AI skill or instruction bundle, not ordinary project documentation.

Keep this `SKILL.md` small. Load only the references needed for the requested mode, standards, and output adapters.

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
2. Gather evidence and intent.
   - For new functional skills, interview for examples, triggering language, artifacts, reusable resources, validation, and platform targets.
   - For project maintainer outputs, interview or scan the repo according to genesis/repo mode.
3. Separate every claim into one of: observed facts, declared user intent, recommended standards, inferred assumptions. Read `references/rules/evidence-vs-recommendation.md`.
4. Choose applicable standards for the selected skill type, artifact type, workflow, assistant platform, and verification needs.
5. Choose output adapters. Default to a Codex-compatible skill folder or platform-neutral instruction bundle; read adapter references only when requested.
6. Validate finished configs with `scripts/validate-config.mjs --strict` when the output is meant to be durable rather than a rough draft.
7. Render general skills with `scripts/render-skill.mjs`; use `scripts/render-project-skill.mjs` only for project maintainer compatibility outputs.
8. Validate general skill outputs with `scripts/validate-skill-output.mjs`; validate project maintainer compatibility outputs with `scripts/validate-project-skill.mjs`. Run platform-specific compatibility checks when relevant.
9. Report the final path, generated files, preserved user areas, validation result, and suggested invocation prompt.

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
- `scripts/validate-skill-config.mjs --input config.json [--strict]`: check general skill config shape, required strict fields, and evidence labels.
- `scripts/render-skill.mjs --input config.json --output <skill-dir> [--template <dir>] [--strict]`: render or refresh a general generated skill while preserving manual blocks.
- `scripts/validate-skill-output.mjs <skill-dir>`: verify required generated skill files, metadata, evidence ledgers, and manual preservation markers.
- `scripts/render-project-skill.mjs --input config.json --output <skill-dir> [--template <dir>] [--strict]`: current compatibility renderer for project maintainer skills while general skill rendering is added.
- `scripts/validate-project-skill.mjs <skill-dir>`: current compatibility validator for generated project maintainer skill folders.
- `scripts/self-check.mjs [--check-installed]`: run repository health checks for render, validation, template failure behavior, and optional installed skill sync.
- `scripts/install-local-skill.mjs [--skills-dir <dir>]`: sync this repository to the local Codex personal skills directory.

Read scripts only when debugging or changing behavior; they are designed to run directly.

<!-- BEGIN USER RULES -->
<!-- Add durable skill-specific rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
