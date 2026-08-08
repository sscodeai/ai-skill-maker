# Workflow Automation Skill Mode

Use this mode when the generated skill should execute a repeatable operational workflow.

## Fits

- API-driven workflows
- issue or PR triage
- release note generation
- data collection and transformation
- browser or app automation
- repository maintenance routines

## Intake

Ask for:

- trigger examples and expected completion criteria
- required tools, CLIs, APIs, credentials, and environment assumptions
- read-only versus write-capable operations
- approval points and failure rollback behavior
- logs, reports, or artifacts the workflow should produce
- deterministic validation or dry-run behavior

## Output Guidance

- Prefer scripts for repeated mechanical steps.
- Keep credentials and secrets out of generated files.
- Make destructive or externally visible steps require explicit confirmation.
- Include dry-run guidance when practical.
- Record verification and rollback steps in the generated skill.
