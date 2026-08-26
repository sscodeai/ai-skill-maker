# AI Skill Maker

[日本語版](README.ja.md)

**A meta-skill that builds, verifies, and governs other AI skills.**

AI Skill Maker turns a rough idea, workflow, or repository into a reusable,
runnable AI skill — then protects that skill from regressing as it evolves.

It fuses the strongest ideas from three open meta-skill projects:

| Source | What we took | How it lands |
| --- | --- | --- |
| [CheshireMew/meta-skills](https://github.com/CheshireMew/meta-skills) | Behavior constitution | A protected core of 11 principles with a SHA-256 fingerprint lock; the maker refuses to silently weaken a skill's guarantees |
| [yaojingang/yao-meta-skill](https://github.com/yaojingang/yao-meta-skill) | Evaluation & release gates | Every generated skill ships an `evals/` skeleton: trigger tests, output assertions, and a BLOCK/ALLOW release gate |
| [gnipbao/dao-skill](https://github.com/gnipbao/dao-skill) | Root-problem thinking & Trust Gate | The maker settles the root problem before designing, and a hard Trust Gate blocks unsafe permissions, data leakage, or opaque dependencies |

## Why a meta-skill?

A skill is a set of instructions an AI agent reuses for a kind of work. Writing
one well is hard: too vague and it misfires, too bloated and it wastes context,
unverified and it silently degrades. AI Skill Maker is the skill for writing
skills — with built-in checks that the result is actually runnable, verifiable,
and safe.

## What it creates

- **Functional skills** — reusable capabilities: presentations, Markdown reports, PDFs, spreadsheets, API workflows, browser automation
- **Document/template skills** — artifact structure, style, and rendering fidelity
- **Workflow automation skills** — deterministic repeated procedures via scripts and tools
- **Project maintainer skills** — long-lived guidance for a specific software repository
- **Adapter instruction bundles** — `AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions

## How it works

```
root problem → trust gate → evidence & intent → config → render → validate → release gate
```

1. **Settle the root problem** — the user's first phrasing is a symptom; the maker finds what they really need and the smallest capability that solves it
2. **Run the Trust Gate** — permissions, sensitive data, dependencies, environment, external actions, rollback. One BLOCK stops generation until the root cause is fixed
3. **Gather evidence & intent** — every claim is labeled `observed_fact`, `declared_intent`, `recommended_standard`, or `inferred_assumption`
4. **Validate & render** — JSON config → strict validation → templated skill folder
5. **Ship with an evaluation skeleton** — `references/evals/` (trigger tests, output assertions, release gate) so the skill can prove it works in a fresh session
6. **Protect the result** — user-authored rule blocks and protected-core blocks are preserved on refresh; the constitution fingerprint lock fails loudly if the maker's own core drifts

## Quick Start

Requires Node.js 18+.

```bash
# Install as a local Codex personal skill
node scripts/install-local-skill.mjs

# Generate a functional skill
node scripts/render-skill.mjs --init-config functional > config.json
node scripts/validate-skill-config.mjs --input config.json --strict
node scripts/render-skill.mjs --input config.json --output ./generated-skill --strict
node scripts/validate-skill-output.mjs ./generated-skill
```

The generated skill is a complete, standalone folder. A future agent session
can use it without this maker.

## Scripts

| Script | Purpose |
| --- | --- |
| `render-skill.mjs` | Render a general skill (functional/document/workflow/refresh) from JSON config; `--init-config` drafts a starter |
| `validate-skill-config.mjs` | Strict-check a general skill config before rendering |
| `validate-skill-output.mjs` | Verify a rendered skill: required files, metadata, evidence labels, USER RULES blocks |
| `render-project-skill.mjs` | Render a project maintainer skill (genesis/repo mode) |
| `validate-config.mjs` | Strict-check a project maintainer config |
| `validate-project-skill.mjs` | Verify a rendered project maintainer skill |
| `collect-repo-signals.mjs` | Scan a repository into JSON signals for repo-mode drafting |
| `draft-project-config.mjs` | Draft a project maintainer config from repo signals |
| `render-adapter.mjs` | Render `AGENTS.md` / `CLAUDE.md` / Cursor / Copilot outputs, preserving user blocks |
| `check-core-principles.mjs` | Verify the maker's protected constitution fingerprint matches the lock |
| `file-budget.mjs` | Enforce the 9,000-token ceiling per active Markdown instruction file |
| `self-check.mjs` | Full repository health check (render, validate, budget, constitution, templates) |
| `install-local-skill.mjs` | Sync the runtime payload to `~/.codex/skills/ai-skill-maker` |

## Repository layout

```text
SKILL.md                  # the maker's own skill: routing, workflow, constitution pointer
agents/openai.yaml        # UI metadata
references/               # mode docs, checklists (intake, trust-gate, quality-gate), schemas, rules
assets/templates/skill/   # general skill template (SKILL.md + references incl. evals/)
assets/templates/project-skill/  # project maintainer template
scripts/                  # renderers, validators, checks, installer
```

## Verification & Release

Run before committing or sharing:

```bash
node scripts/self-check.mjs          # full health check
node scripts/self-check.mjs --check-installed  # also verify the installed skill matches the repo
node scripts/check-core-principles.mjs         # constitution fingerprint
node scripts/file-budget.mjs                   # instruction-file budget
```

Generated skills carry their own release gate (`references/evals/release-gate.md`):
trigger, output, structure, budget, trust, and license must all be ALLOW with
recorded evidence before the skill is claimed release-ready. Missing evidence is
a BLOCK, never an ALLOW.

## License

Apache-2.0
