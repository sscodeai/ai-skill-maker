# Refresh Workflow

Use this workflow when updating an existing AI skill or instruction bundle after its purpose, source evidence, examples, templates, scripts, adapters, or target platform behavior changes.

## When to Refresh

- The skill's capability, triggering situations, artifacts, tool usage, validation process, or target assistant platforms change materially.
- Source examples, templates, scripts, assets, repo facts, or adapter files no longer match the generated instructions.
- Author intent, language/locale profile, public voice, safety boundaries, or quality bar changes.
- Generated references contain stale observed facts, outdated recommendations, or assumptions that should now be verified.
- New output adapters are requested.

## Procedure

1. Identify the existing skill or instruction bundle and classify it as functional, document/template, workflow automation, project maintainer, adapter-only, or mixed.
2. Preserve every manual block exactly:

```markdown
<!-- BEGIN USER RULES -->
...
<!-- END USER RULES -->
```

3. Scan current source files directly before editing. For project maintainer outputs, rerun `scripts/collect-repo-signals.mjs <repo>`. For general skills, inspect `SKILL.md`, `agents/openai.yaml`, references, examples, templates, assets, scripts, and adapters.
4. Reclassify claims as `observed_fact`, `declared_intent`, `recommended_standard`, or `inferred_assumption`.
5. Replace stale generated sections outside manual blocks.
6. Keep user-authored rules even if generated recommendations change. If a user rule appears unsafe or contradictory, report it instead of deleting it.
7. Match the validator to the renderer:
   - Use `scripts/validate-skill-output.mjs <skill-dir>` for outputs from `scripts/render-skill.mjs`.
   - Use `scripts/validate-project-skill.mjs <skill-dir>` only for project maintainer compatibility outputs from `scripts/render-project-skill.mjs`.
8. Report preserved blocks, changed files, remaining assumptions, adapter behavior, and verification status.

## Conflict Handling

- If source evidence conflicts with author intent, record both: current behavior as `observed_fact`, desired direction as `declared_intent`.
- If a recommendation conflicts with declared intent, prefer declared intent unless it creates a high-risk issue.
- If observed facts are stale or ambiguous, downgrade them to `inferred_assumption` until verified.

## Refresh Output Notes

- Do not rewrite generated references into a single large file.
- Do not remove adapters that the skill or project still uses.
- Do not hand-edit generated output files unless the generated-files reference or adapter contract explicitly allows it.
- Keep reusable operating instructions in English unless the skill's language policy or user intent says otherwise.
