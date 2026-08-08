# Output Schema

AI Skill Maker can generate full skill folders or smaller assistant instruction bundles. The output must be usable without this meta-skill after creation.

## Full Skill Folder Contract

A Codex-compatible generated skill should include:

- `SKILL.md`: concise trigger metadata and routing workflow.
- `agents/openai.yaml`: UI metadata for discovery and default prompt.
- `references/`: durable domain rules, schemas, examples, standards, rubrics, or workflow details loaded only when relevant.
- `assets/`: reusable templates, fixtures, visual assets, boilerplate, examples, or other files copied or transformed by the skill.
- `scripts/`: deterministic repeated procedures such as rendering, validation, extraction, conversion, collection, or health checks.

Only `SKILL.md` is always required by the platform. Include optional folders only when they materially improve repeated performance, reliability, or context efficiency.

## Skill Type Contracts

### Functional Skill

Use for reusable capabilities such as presentations, Markdown reports, PDFs, spreadsheets, API workflows, browser tasks, or data transformations.

Expected output:

- concise `SKILL.md` with triggers, workflow, tool routing, and validation expectations
- references for domain rules and non-obvious procedure
- assets for templates, examples, fixtures, or style sources
- scripts for deterministic repeated operations
- forward-test prompts when the skill is complex or high variance

### Document Template Skill

Use for repeatable artifacts with structure, style, or rendering expectations.

Expected output:

- artifact contract and audience notes
- style, layout, and language references
- reusable template or sample assets when available
- validation or render-check guidance

### Workflow Automation Skill

Use for operational workflows involving tools, APIs, repositories, browser/app automation, or external systems.

Expected output:

- required tools and environment assumptions
- dry-run, approval, and rollback guidance
- scripts for repeatable mechanical steps
- verification and reporting instructions

### Project Maintainer Skill

Use for long-term maintenance of a specific software project.

Expected output:

- project intent, map, architecture, coding/content standards, workflows, verification, release, and generated-file references
- observed facts with source citations
- refresh-safe user rule blocks
- optional health-check scripts

### Adapter Instruction Bundle

Use for platform-specific instruction files, either standalone or alongside a full generated skill.

Expected output:

- concise platform-appropriate guidance
- clear canonical source statement
- preserved generated markers for refresh
- no unmarked overwrite unless explicitly forced

## Evidence Blocks

Reference files should include an `Evidence Ledger` section when the output contains factual, normative, or inferred claims.

Use these labels:

- `observed_fact`: supported by repository files, existing skill files, examples, command output, metadata, or other inspectable evidence. Cite source paths where possible.
- `declared_intent`: explicitly provided by the user during the maker session.
- `recommended_standard`: a standard selected by this meta-skill because it fits the skill type.
- `inferred_assumption`: a plausible assumption made from partial evidence. Keep it narrow and easy to revise.

Observed facts should cite paths like `SKILL.md`, `agents/openai.yaml`, `references/schema.md`, `assets/template.pptx`, `package.json`, or `src/lib/foo.ts`.

## Manual Preservation Blocks

Generated Markdown files should contain one editable user block when the file is expected to be refreshed:

```markdown
<!-- BEGIN USER RULES -->
<!-- Add durable skill-specific rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
```

Refresh workflow must preserve the content between markers. Generated content outside the block may be replaced.

## SKILL.md Requirements

The generated `SKILL.md` should:

- use English core instructions unless the target platform or user explicitly chooses another language
- include only trigger-critical workflow and routing details
- point to relevant references, assets, and scripts
- avoid duplicating long standards that belong in `references/`
- state validation expectations clearly

## agents/openai.yaml Requirements

Use:

```yaml
interface:
  display_name: "<Skill Display Name>"
  short_description: "<What the skill helps with>"
  default_prompt: "Use $<skill-name> to <typical task>."
```

Keep strings quoted. Do not add icons or brand color unless the user supplied them.
