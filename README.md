<div align="center">

# 🧠 AI Skill Maker

**Build reliable AI skills from rough intent, repo evidence, and repeatable workflows.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Runtime: Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933.svg)](#-quick-start)
[![Skill: Codex](https://img.shields.io/badge/Codex-Personal%20Skill-111827.svg)](#-install-as-a-codex-skill)
[![Validation: self-check](https://img.shields.io/badge/Validation-self--check-success.svg)](#-validation--release)

[日本語版](README.ja.md)

</div>

---

AI Skill Maker is a meta-skill for designing, rendering, validating, and
refreshing reusable AI skills and assistant instruction bundles.

It turns rough intent, a repeatable workflow, or an existing repository into a
structured skill folder with evidence labels, validation scripts, release gates,
and refresh-safe user rule blocks.

```bash
node scripts/self-check.mjs
```

---

## 📖 Contents

| # | Section | What You Get |
| --- | --- | --- |
| 1 | [Why It Exists](#-why-it-exists) | The problem this project solves |
| 2 | [What It Builds](#-what-it-builds) | Supported skill and adapter outputs |
| 3 | [Quick Start](#-quick-start) | Copy-paste commands to validate and render |
| 4 | [Workflow](#-workflow) | The generation pipeline |
| 5 | [Generated Layout](#-generated-layout) | What rendered skills contain |
| 6 | [Command Reference](#-command-reference) | Script-by-script usage |
| 7 | [Validation & Release](#-validation--release) | Required checks before shipping |
| 8 | [Safety Model](#-safety-model) | Trust gates and protected principles |

---

## ✨ Why It Exists

Reusable AI skills are easy to draft and hard to keep reliable. A useful skill
needs a narrow trigger, clear boundaries, runnable workflow, verifiable output,
and enough structure that future agents can refresh it without erasing
maintainer intent.

AI Skill Maker provides that structure. It helps an agent settle the root
problem, collect evidence, choose the right output mode, render the skill from a
strict config, and verify the result before it is treated as ready.

> The goal is not a longer prompt. The goal is a smaller, sharper capability
> that can be reused, tested, refreshed, and trusted.

---

## 🧩 What It Builds

| Output | Best For | Primary Renderer |
| --- | --- | --- |
| 🛠️ Functional skill | Reports, PDFs, spreadsheets, API tasks, browser workflows, data processing | `scripts/render-skill.mjs` |
| 📄 Document/template skill | Artifact structure, style, reusable assets, rendered fidelity | `scripts/render-skill.mjs` |
| 🔁 Workflow automation skill | Repeatable procedures through tools, CLIs, APIs, or scripts | `scripts/render-skill.mjs` |
| 🧭 Project maintainer skill | Long-lived AI guidance for a specific repository | `scripts/render-project-skill.mjs` |
| 🔌 Adapter instruction bundle | `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions | `scripts/render-adapter.mjs` |

### 🏛️ Design Pillars

| Pillar | What It Means |
| --- | --- |
| 🎯 Root problem first | Design around the recurring need, not the user's first phrasing |
| 🧾 Evidence discipline | Label claims as `observed_fact`, `declared_intent`, `recommended_standard`, or `inferred_assumption` |
| 🛡️ Trust Gate | Block unsafe permissions, sensitive-data leakage, opaque dependencies, and unfit environments |
| 🧪 Evaluation skeleton | Ship trigger tests, output assertions, and BLOCK/ALLOW release gates |
| 🔒 Refresh safety | Preserve user-authored rule blocks and protected core blocks |
| 📏 File budget | Keep active Markdown instruction files below the 9,000-token ceiling |

---

## 🚀 Quick Start

Requires Node.js 18+.

```bash
git clone https://github.com/sscodeai/ai-skill-maker.git
cd ai-skill-maker
node scripts/self-check.mjs
```

### ⚡ Create A Functional Skill

```bash
node scripts/render-skill.mjs --init-config functional > config.json
node scripts/validate-skill-config.mjs --input config.json --mode functional --strict
node scripts/render-skill.mjs --input config.json --output ./generated-skill --mode functional --strict
node scripts/validate-skill-output.mjs ./generated-skill
node scripts/file-budget.mjs ./generated-skill
```

### 🧭 Create A Project Maintainer Skill

```bash
node scripts/draft-project-config.mjs --repo . > project-config.json
node scripts/validate-config.mjs --input project-config.json --mode repo --strict
node scripts/render-project-skill.mjs --input project-config.json --output ./project-maintainer --mode repo --strict
node scripts/validate-project-skill.mjs ./project-maintainer
```

### 🧠 Install As A Codex Skill

```bash
node scripts/install-local-skill.mjs
```

---

## 🧭 Workflow

```text
┌──────────────┐
│ Root Problem │
└──────┬───────┘
       ↓
┌──────────────┐
│  Trust Gate  │
└──────┬───────┘
       ↓
┌─────────────────────┐
│ Evidence And Intent │
└──────┬──────────────┘
       ↓
┌───────────────┐
│ Strict Config │
└──────┬────────┘
       ↓
┌────────┐
│ Render │
└───┬────┘
    ↓
┌──────────┐
│ Validate │
└────┬─────┘
     ↓
┌──────────────┐
│ Release Gate │
└──────────────┘
```

| Step | Gate | Output |
| --- | --- | --- |
| 1 | Identify the smallest useful capability | One-sentence root problem |
| 2 | Check permissions, secrets, dependencies, environment, external actions, rollback | Trust Gate PASS/BLOCK |
| 3 | Separate facts from intent and assumptions | Evidence-labeled config |
| 4 | Select mode and adapter | Renderer choice |
| 5 | Validate before rendering | Strict config check |
| 6 | Render or refresh | Skill folder or instruction bundle |
| 7 | Validate output | Structure, metadata, ledgers, user blocks, file budget |
| 8 | Release only with evidence | Trigger tests, output assertions, release gate |

---

## 🏗️ Generated Layout

### General Skill

```text
generated-skill/
  SKILL.md
  agents/
    openai.yaml
  references/
    skill-intent.md
    workflows.md
    resources.md
    verification.md
    generated-files.md
    evals/
      trigger-tests.md
      output-assertions.md
      release-gate.md
  scripts/
    health-check.mjs
```

### Project Maintainer Skill

```text
project-maintainer/
  SKILL.md
  agents/
    openai.yaml
  references/
    project-intent.md
    project-map.md
    architecture.md
    coding-standards.md
    content-style.md
    workflows.md
    verification.md
    release.md
    generated-files.md
    evals/
      trigger-tests.md
      output-assertions.md
      release-gate.md
  scripts/
    health-check.mjs
```

---

## 🗂️ Repository Layout

```text
SKILL.md                         # maker runtime instructions
agents/openai.yaml               # Codex/OpenAI skill metadata
assets/examples/                 # starter configs for every render mode
assets/templates/skill/          # general skill template
assets/templates/project-skill/  # project maintainer skill template
references/                      # modes, schemas, adapters, checklists, rules, evals
scripts/                         # renderers, validators, repo scanners, guardrails
```

---

## 🛠️ Command Reference

| Command | Purpose |
| --- | --- |
| `node scripts/render-skill.mjs --init-config <mode>` | Print a starter config for `functional`, `document`, `workflow`, or `refresh` mode |
| `node scripts/validate-skill-config.mjs --input config.json --strict` | Validate a general skill config before rendering |
| `node scripts/render-skill.mjs --input config.json --output <dir> --strict` | Render or refresh a general skill |
| `node scripts/validate-skill-output.mjs <dir>` | Validate a rendered general skill folder |
| `node scripts/draft-project-config.mjs --repo <repo>` | Draft a project maintainer config from repository signals |
| `node scripts/validate-config.mjs --input config.json --mode genesis\|repo --strict` | Validate a project maintainer config |
| `node scripts/render-project-skill.mjs --input config.json --output <dir> --strict` | Render a project maintainer skill |
| `node scripts/validate-project-skill.mjs <dir>` | Validate a rendered project maintainer skill |
| `node scripts/render-adapter.mjs --input config.json --adapter agents\|claude\|cursor\|copilot --output <path>` | Render assistant instruction files while preserving generated blocks |
| `node scripts/check-core-principles.mjs` | Verify the protected core principle fingerprint |
| `node scripts/file-budget.mjs [skill-dir]` | Enforce the 9,000-token ceiling for active Markdown instruction files |
| `node scripts/self-check.mjs` | Run the full repository health check |
| `node scripts/install-local-skill.mjs` | Install this maker into the local Codex personal skills directory |

---

## ✅ Validation & Release

Run these checks before merging, publishing, or installing a changed maker:

```bash
node scripts/self-check.mjs
node scripts/check-core-principles.mjs
node scripts/file-budget.mjs
git diff --check
```

Run this when you also want to compare the repository payload with the installed
local skill:

```bash
node scripts/self-check.mjs --check-installed
```

Generated skills include `references/evals/release-gate.md`. Treat the gate as
BLOCK/ALLOW only: trigger tests, output assertions, structure validation, file
budget, trust, and license attribution must all have recorded evidence before a
skill is described as release-ready.

---

## 🛡️ Safety Model

AI Skill Maker is designed to produce instruction assets, not to perform
unbounded external actions. Generated skills should require explicit user
permission before destructive operations, credential-sensitive work, remote
publishing, force-pushing, visibility changes, or other high-risk actions.

The maker's protected core principles live in
`references/rules/protected-core-principles.md` and are locked by
`references/rules/core-principles.lock.json`. Regenerate the lock only when the
user explicitly approves changing a protected core principle.

| Guardrail | Enforced By |
| --- | --- |
| Protected core fingerprint | `scripts/check-core-principles.mjs` |
| Instruction file budget | `scripts/file-budget.mjs` |
| Config shape and evidence labels | `validate-skill-config.mjs`, `validate-config.mjs` |
| Rendered output structure | `validate-skill-output.mjs`, `validate-project-skill.mjs` |
| End-to-end repository health | `scripts/self-check.mjs` |

---

## 🌱 Inspiration

AI Skill Maker incorporates ideas from several open meta-skill projects:

| Source | Adopted Idea | Implementation |
| --- | --- | --- |
| [CheshireMew/meta-skills](https://github.com/CheshireMew/meta-skills) | Behavior constitution | Protected core principles with a SHA-256 fingerprint lock |
| [yaojingang/yao-meta-skill](https://github.com/yaojingang/yao-meta-skill) | Evaluation and release gates | `references/evals/` skeleton for generated skills |
| [gnipbao/dao-skill](https://github.com/gnipbao/dao-skill) | Root-problem thinking and Trust Gate | Root-problem intake plus hard PASS/BLOCK trust checks |

---

## 🤝 Contributing

Keep changes evidence-backed and easy to verify:

- Update schemas, templates, and validators together when output shape changes.
- Preserve `<!-- BEGIN USER RULES -->` blocks during refresh-related edits.
- Keep active Markdown instruction files below the file budget.
- Add or update `scripts/self-check.mjs` coverage for behavioral changes.
- Run the validation commands in this README before opening a pull request.

---

## 📄 License

Apache-2.0
