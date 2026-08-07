# Config Schema

`scripts/render-project-skill.mjs` renders `assets/templates/project-skill` from a JSON config.

The config is intentionally plain JSON so AI agents and humans can edit it without a build step. Most fields render directly into Markdown sections. Use evidence labels inside field values when the text makes factual or normative claims.

## Required Fields

- `projectName`: Human-facing project name.

## Recommended Fields

- `skillName`: Lowercase hyphen-case output skill name. If omitted, the renderer derives `<project-name>-maintainer`.
- `shortDescription`: Short UI description for `agents/openai.yaml`.
- `evidenceLedger`: Shared evidence ledger appended to reference files unless a more specific ledger is rendered later.

## Project Intent Fields

- `projectPurpose`: Product purpose and non-goals.
- `audience`: Target users and maintainers.
- `publicVoice`: Public expression, tone, and positioning.
- `constraints`: Technical, legal, dependency, hosting, privacy, security, or process constraints.
- `maintenanceGoals`: Long-term maintenance posture.
- `questionsToRevisit`: Known open questions.

## Project Map Fields

- `importantPaths`: Important directories and files.
- `entryPoints`: Source, content, CLI, route, package, or app entry points.
- `ownershipBoundaries`: Areas that need caution, confirmation, or special ownership.

## Architecture Fields

- `systemShape`: High-level system or repo shape.
- `dataFlow`: Data, content, build, or request flow.
- `integrationPoints`: External systems, deployment targets, plugins, APIs, or assistant adapters.
- `designConstraints`: Architectural constraints and tradeoffs.

## Coding Standards Fields

- `stylePatterns`: Coding and structural patterns to follow.
- `dependencyPolicy`: Dependency addition, update, and removal policy.
- `patternsToAvoid`: Anti-patterns and risky edits.

## Content Style Fields

- `languagePolicy`: Docs, UI, comments, release notes, and locale guidance.
- `toneAndNaming`: Naming, terminology, formality, and public tone.
- `documentationConventions`: Docs structure, examples, links, code fences, and terminology.

## Workflow Fields

- `commonChangeFlow`: Normal maintenance sequence.
- `firstRepositoryTasks`: Day-one or next-step tasks, especially useful in genesis mode.
- `reviewFlow`: Review checklist for future agents.

## Verification Fields

- `verificationCommands`: Concrete commands or recommended checks.
- `manualQa`: Manual verification steps.
- `riskGates`: Cases that require extra caution, broader tests, or user confirmation.

## Release Fields

- `versioning`: Versioning policy.
- `changelog`: Changelog and release notes policy.
- `deployPublish`: Deploy or publish flow.
- `rollback`: Rollback or revert expectations.

## Generated Files Fields

- `generatedOutput`: Build output and generated artifacts.
- `lockfiles`: Lockfile and package metadata policy.
- `snapshotsSchemasVendored`: Snapshots, schemas, vendored code, and generated type files.
- `editRestrictions`: Files or file categories to avoid hand-editing.

## Evidence Guidance

Use these labels in field values:

- `observed_fact`: cite repo paths when available. In strict mode, citations inside backticks must look like source paths, file names with extensions, globs, hidden repo directories, or known repo roots such as `src`, `docs`, and `tests`.
- `declared_intent`: cite the maker interview or maintainer statement.
- `recommended_standard`: cite the selected standard or explain the fit.
- `inferred_assumption`: keep narrow and easy to revise.

Example field value:

```json
{
  "verificationCommands": "- observed_fact: `package.json` defines `npm run build` for production builds.\n- recommended_standard: Run build before delivering documentation UI changes."
}
```

## Mode Notes

Genesis configs should mostly contain `declared_intent`, `recommended_standard`, and `inferred_assumption`.

Repo configs should include as many cited `observed_fact` entries as practical, especially for scripts, source paths, docs layout, CI, generated files, and release workflow.
