# Skill Config Schema

`scripts/render-skill.mjs` renders `assets/templates/skill` from a JSON config.

The config is intentionally plain JSON. Most fields render directly into `SKILL.md`, `agents/openai.yaml`, and generated references. Use evidence labels inside field values when the text makes factual, normative, or inferred claims.

## Required In Strict Mode

- `skillName`: Lowercase hyphen-case output skill name.
- `displayName`: Human-facing skill display name.
- `skillDescription`: Trigger-oriented description for generated `SKILL.md` frontmatter. In strict mode, include explicit trigger wording such as `Use when`.
- `shortDescription`: Short UI description for `agents/openai.yaml`.
- `defaultTask`: Default prompt action after `Use $<skill-name> to`.
- `skillPurpose`: Why the generated skill exists.
- `capability`: What the skill should do.
- `usersAndTriggers`: Target users and triggering requests.
- `inputsAndOutputs`: Expected input and output shapes.
- `boundaries`: Safety, confirmation, privacy, destructive-operation, or scope boundaries.
- `workflow`: Concise step-by-step workflow for the generated `SKILL.md`.
- `resources`: High-level references/assets/scripts guidance.
- `verification`: Short verification guidance for the generated `SKILL.md`.
- `standardFlow`: Detailed workflow reference.
- `referenceResources`: Reference files the skill should use or grow.
- `scriptResources`: Scripts the skill should include or later add.
- `automatedChecks`: Deterministic checks when available.
- `manualQa`: Manual review expectations.
- `forwardTests`: Fresh-session prompts or scenarios for testing the generated skill.
- `generatedOutputs`: Files or artifacts the generated skill may produce.
- `editRestrictions`: Files or source artifacts that should not be overwritten casually.
- `evidenceLedger`: Shared evidence ledger.

## Optional Fields

- `mode`: Optional mode hint, one of `functional`, `document`, `workflow`, or `refresh`.
- `edgeCases`: Ambiguous, high-risk, or unusual requests.
- `failureHandling`: Recovery and reporting behavior when tools or assumptions fail.
- `assetResources`: Reusable templates, examples, visual assets, fixtures, or boilerplate.

## Evidence Guidance

Use these labels in field values:

- `observed_fact`: cite existing skill files, source repo paths, examples, assets, scripts, command output, or metadata when available.
- `declared_intent`: cite the maker interview or maintainer statement.
- `recommended_standard`: cite the selected standard or explain the fit.
- `inferred_assumption`: keep narrow and easy to revise.

Example field value:

```json
{
  "verification": "- recommended_standard: Render or inspect document outputs when layout matters.\n- declared_intent: The maintainer wants visual QA before delivery."
}
```

## Starter Configs

Use:

```bash
node scripts/render-skill.mjs --init-config functional
node scripts/render-skill.mjs --init-config document
node scripts/render-skill.mjs --init-config workflow
node scripts/render-skill.mjs --init-config refresh
node scripts/render-skill.mjs --print-schema
```
