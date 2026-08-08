# Functional Skill Mode

Use this mode when creating a skill whose primary purpose is to perform a reusable capability rather than maintain one repository.

## Fit

Functional skills are appropriate for:

- generating presentations, Markdown reports, PDFs, spreadsheets, images, or structured documents
- operating a repeatable workflow such as browser testing, API calls, data extraction, transformation, publishing, or triage
- using bundled scripts, templates, assets, schemas, or domain references to reduce repeated reasoning
- wrapping a fragile process that benefits from deterministic validation

## Intake

Interview for:

- capability name, target users, and triggering user requests
- 3-5 concrete example tasks the generated skill should handle
- expected inputs, outputs, file formats, and artifact quality bar
- whether the skill should create, edit, inspect, validate, or automate
- reusable resources: scripts, references, templates, assets, fixtures, schemas, or style guides
- platform targets: Codex skill, AGENTS.md, CLAUDE.md, Cursor rules, Copilot instructions, or multiple adapters
- language and locale preferences for interviews, generated docs, and public-facing artifacts
- validation strategy: deterministic scripts, visual checks, schema checks, forward tests, or manual QA
- safety boundaries: destructive operations, network access, credentials, paid APIs, private data, and user confirmations

## Output Guidance

Generated functional skills should:

- keep `SKILL.md` concise, focused on trigger, workflow, and routing
- put durable domain details in `references/`
- put reusable templates, fixtures, examples, fonts, images, or boilerplate in `assets/`
- put deterministic repeated procedures in `scripts/`
- include validation instructions that a future agent can actually run
- include forward-test prompts for complex or high-variance skills
- preserve user-authored rule blocks during refresh

## Evidence Guidance

- Use `declared_intent` for creator goals, preferred platforms, artifact style, safety boundaries, and language profile.
- Use `observed_fact` for existing skill files, examples, templates, scripts, schemas, source repository files, or command outputs.
- Use `recommended_standard` for selected skill-design patterns from `skill-creator` principles.
- Use `inferred_assumption` only when a detail is necessary to proceed and should be easy to revise.
