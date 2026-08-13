# AI Skill Maker

[日本語版](README.ja.md)

Create reusable AI skills and instruction bundles for coding agents.

AI Skill Maker is a meta-skill. It helps design durable skills that future AI sessions can use to perform a capability, generate a repeatable artifact, automate a workflow, maintain a software project, or adapt project guidance to assistant platforms.

This repository starts from the proven `ai-project-skill-maker` foundation and generalizes it beyond project maintainer skills. The first scaffold keeps the project-maintainer renderer and validation chain as compatibility tooling while broader functional-skill modes are added.

## Source of Truth and Installation

This repository is the canonical source for the `ai-skill-maker` skill. When using it as a local Codex personal skill, install or sync the runtime payload to:

```text
~/.codex/skills/ai-skill-maker
```

The local skill install contains only the runtime payload: `SKILL.md`, `agents/`, `references/`, `assets/`, and `scripts/`. Repository documents such as `README.md`, `README.ja.md`, and `LICENSE` remain in the repository.

## Target Outputs

AI Skill Maker is intended to create or refresh:

- functional skills, such as presentation, Markdown report, PDF, spreadsheet, browser automation, or API workflow skills
- document/template skills, where reusable assets and style rules matter
- workflow automation skills with deterministic scripts
- project maintainer skills for long-lived repositories
- adapter instruction bundles such as `AGENTS.md`, `CLAUDE.md`, Cursor rules, and GitHub Copilot instructions

## Evidence Model

Generated references separate claims into:

- `observed_fact`: evidence from repository files, commands, metadata, examples, or existing skill files
- `declared_intent`: goals, constraints, and preferences explicitly provided by the maintainer
- `recommended_standard`: standards selected because they fit the skill type
- `inferred_assumption`: cautious assumptions made from incomplete information

Observed facts should cite source files whenever possible.

## Current Scaffold

The initial scaffold includes compatibility tooling inherited from `ai-project-skill-maker`:

- repo signal collection
- draft project-maintainer config generation
- strict config validation
- project-maintainer skill rendering and validation
- adapter rendering for `AGENTS.md`, `CLAUDE.md`, Cursor rules, and `.github/copilot-instructions.md`
- refresh preservation for user-authored blocks
- functional-skill intake and existing-skill refresh checklists
- generalized evidence and language policies for skills and artifacts
- local install and self-check scripts

The next revisions add general skill output schemas, functional-skill intake, generalized templates, examples, and forward tests.

## Scripts

Render a general functional skill from a JSON config:

```bash
node scripts/render-skill.mjs --init-config functional > config.json
node scripts/validate-skill-config.mjs --input config.json --strict
node scripts/render-skill.mjs --input config.json --output ./generated-skill --strict
node scripts/validate-skill-output.mjs ./generated-skill
```

Starter configs are available for `functional`, `document`, `workflow`, and `refresh`. See `references/skill-config-schema.md` for general skill configs and `references/project-config-schema.md` for project maintainer compatibility configs.

Use `validate-skill-output.mjs` for outputs from `render-skill.mjs`. Use `validate-project-skill.mjs` only for compatibility project-maintainer outputs from `render-project-skill.mjs`.

Collect repository signals:

```bash
node scripts/collect-repo-signals.mjs /path/to/repo > repo-signals.json
```

Draft a compatibility project-maintainer config:

```bash
node scripts/draft-project-config.mjs --repo /path/to/repo > config.json
```

Render current adapter outputs:

```bash
node scripts/render-adapter.mjs --input config.json --adapter agents --output .
node scripts/render-adapter.mjs --input config.json --adapter claude --output .
node scripts/render-adapter.mjs --input config.json --adapter cursor --output .
node scripts/render-adapter.mjs --input config.json --adapter copilot --output .
```

Run the repository self-check:

```bash
node scripts/self-check.mjs
node scripts/self-check.mjs --check-installed
```

Forward-test prompts for fresh-session evaluation live in:

```text
references/evals/forward-tests.md
```

Install or sync the local Codex personal skill:

```bash
node scripts/install-local-skill.mjs
```

## License

Apache-2.0
