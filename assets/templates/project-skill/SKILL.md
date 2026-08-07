---
name: {{skillName}}
description: Maintain {{projectName}} as a project-specific AI maintainer skill. Use when an AI coding agent needs to understand this project's intent, architecture, coding standards, content style, workflows, generated files, verification commands, releases, or long-term maintenance conventions before making or reviewing changes.
---

# {{projectName}} Maintainer

## Workflow

1. Read `references/project-intent.md` for goals, audience, constraints, and maintenance posture.
2. Read `references/project-map.md` before navigating or editing files.
3. Read `references/generated-files.md` before modifying generated, vendored, lock, schema, snapshot, or build output files.
4. Load only the relevant detail references for the current task:
   - `references/architecture.md`
   - `references/coding-standards.md`
   - `references/content-style.md`
   - `references/workflows.md`
   - `references/verification.md`
   - `references/release.md`
5. Make changes in the repo's existing style.
6. Run the verification commands appropriate to the change and report any commands that could not be run.

## Evidence Discipline

Treat reference claims according to their labels:

- `observed_fact`: repo evidence or command output.
- `declared_intent`: maintainer preference or product goal.
- `recommended_standard`: selected maintenance norm.
- `inferred_assumption`: cautious assumption that may need confirmation.

When evidence conflicts, prefer observed facts for current repo behavior and declared intent for future direction.

<!-- BEGIN USER RULES -->
<!-- Add durable project-specific rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
