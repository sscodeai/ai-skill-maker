# Refresh Workflow

Use this workflow when updating an existing project maintainer skill or instruction bundle after the project changes.

## When to Refresh

- Repository structure, framework, package manager, CI, tests, release process, or deployment changes materially.
- Maintainer intent, language/locale profile, public voice, or quality bar changes.
- Generated skill references contain stale observed facts.
- New adapter outputs are requested.

## Procedure

1. Identify the existing maintainer skill or instruction bundle.
2. Preserve every manual block exactly:

```markdown
<!-- BEGIN USER RULES -->
...
<!-- END USER RULES -->
```

3. In repo mode, rerun `scripts/collect-repo-signals.mjs <repo>` and inspect changed source files directly.
4. Reclassify claims as `observed_fact`, `declared_intent`, `recommended_standard`, or `inferred_assumption`.
5. Replace stale generated sections outside manual blocks.
6. Keep user-authored rules even if generated recommendations change. If a user rule appears unsafe or contradictory, report it instead of deleting it.
7. Validate the rendered output directory with `scripts/validate-project-skill.mjs`.
8. Report preserved blocks, changed references, remaining assumptions, and verification status.

## Conflict Handling

- If repo evidence conflicts with maintainer intent, record both: current behavior as `observed_fact`, desired direction as `declared_intent`.
- If a recommendation conflicts with declared intent, prefer declared intent unless it creates a high-risk issue.
- If observed facts are stale or ambiguous, downgrade them to `inferred_assumption` until verified.

## Refresh Output Notes

- Do not rewrite generated references into a single large file.
- Do not remove adapters that the project still uses.
- Do not hand-edit generated output files unless the generated-files reference explicitly allows it.
