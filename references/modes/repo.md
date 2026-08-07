# Repo Mode

Use repo mode when an existing repository can provide maintenance evidence.

## Goal

Build a project maintainer skill from observed repository facts first, then layer user intent and recommendations.

## Procedure

1. Run `scripts/collect-repo-signals.mjs <repo> > repo-signals.json`.
2. Inspect the most important discovered files directly: README, package metadata, docs index, CI workflow, test config, primary source entry points, and contribution/release docs if present.
3. Read `references/checklists/repo-scan.md` and fill gaps with `rg`, `rg --files`, and targeted file reads.
4. Ask a small set of follow-up questions focused on future maintenance goals, not facts the repo already reveals.
5. Select relevant standards from `references/standards/`, marking them as recommended standards.
6. Render the project maintainer skill and validate it.

## Repo-Specific Rules

- Observed facts must cite source paths whenever possible.
- If repo evidence conflicts with user preference, record the repo state as `observed_fact` and the desired direction as `declared_intent`.
- Do not silently "modernize" the maintainer skill beyond the repo's actual practices; use recommended standards for proposed improvements.
- Include risky/generated/edit-careful files in `references/generated-files.md`.
- Include exact scripts from `package.json`, CI, or project tooling in `references/verification.md`.

## Follow-Up Question Bias

Ask about:

- Current maintenance pain points.
- Desired strictness for dependencies, formatting, testing, and releases.
- Public voice and documentation tone.
- Whether to optimize for stability, contributor friendliness, speed, or polish.
- Any files or conventions that are important but not visible in the repo.
