---
name: {{skillName}}
description: {{yaml:skillDescription}}
---

# {{displayName}}

## Purpose

{{skillPurpose}}

Keep this `SKILL.md` concise. Load references, assets, and scripts only when they are relevant to the user's request.

## Workflow

{{workflow}}

## Resources

{{resources}}

## Verification

{{verification}}

## Evaluation

The skill ships with an evaluation skeleton under `references/evals/`:

- `trigger-tests.md` — requests that should and should not activate this skill
- `output-assertions.md` — objective assertions about the final output
- `release-gate.md` — release checklist (BLOCK/ALLOW) before sharing or publishing

Fill the tables with real examples before relying on this skill in production,
and record pass/fail evidence after each run. Do not claim the skill is
release-ready until the release gate is all ALLOW with recorded evidence.

## Refresh

When refreshing this skill, preserve user-authored rules inside the block below and update generated guidance only when supported by new evidence or declared maintainer intent.

<!-- BEGIN USER RULES -->
<!-- Add durable skill-specific rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
