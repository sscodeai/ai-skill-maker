# Functional Skill Intake

Use this checklist before rendering a new functional skill.

## First Questions

- What capability should the skill provide?
- What user requests should trigger this skill?
- What are 3-5 concrete example tasks the skill must handle?
- What should the skill create, edit, inspect, validate, automate, or explain?
- Which platforms should the output target: Codex skill, AGENTS.md, CLAUDE.md, Cursor rules, Copilot instructions, or multiple?
- What language does the author think and review best in, and should the interview or generated references use it?

## Capability Shape

- Inputs: files, prompts, data, URLs, screenshots, existing artifacts, APIs, credentials, repo state.
- Outputs: file formats, directories, instruction files, reports, generated media, code changes, logs.
- Reusable resources: scripts, references, assets, templates, schemas, fixtures, examples, style guides.
- Tooling: CLIs, libraries, external services, browser/app automation, local runtimes.
- Validation: deterministic scripts, render checks, visual QA, schema checks, sample tasks, forward tests.

## Boundaries

- Destructive operations.
- Network or paid API usage.
- Credential and private-data handling.
- Legal, medical, financial, or security-sensitive outputs.
- When to ask the user for confirmation before continuing.

## Completion Criteria

- The skill has concise trigger metadata.
- The main workflow can be followed by a future agent without this maker.
- Detailed reusable knowledge lives in references, assets, or scripts.
- Verification is concrete enough to run or clearly marked as assumption.
- Refresh behavior preserves user-authored rules.
