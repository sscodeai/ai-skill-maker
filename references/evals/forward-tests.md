# Forward Tests

Use these prompts to test whether AI Skill Maker can create useful skills and instruction bundles without relying on hidden context from its own implementation work.

## How To Run

- Run forward tests in a fresh AI session when possible.
- Provide only the prompt, the target repository or stated skill intent, and ordinary user constraints.
- Do not provide expected answers, known bugs, implementation notes, or prior review findings unless a test explicitly asks for them.
- Save raw outputs, rendered files, validation logs, and any follow-up questions asked by the agent.
- Judge whether the generated skill would help a future agent perform the target capability, not whether it perfectly mirrors this repository.

## Evaluation Criteria

- The agent selects functional, document/template, workflow automation, project maintainer, adapter, or refresh mode correctly.
- New-skill intake asks language and locale questions before deep capability design.
- Functional skill intake collects concrete examples, triggers, inputs, outputs, reusable resources, validation, and safety boundaries.
- Existing-skill refresh scans current skill files before asking follow-up questions.
- Claims are separated into `observed_fact`, `declared_intent`, `recommended_standard`, and `inferred_assumption`.
- Observed facts cite source paths where practical.
- Output keeps detailed durable guidance in `references/`, not only in generated `SKILL.md`.
- Rendered general skills validate with `scripts/validate-skill-output.mjs`.
- Project maintainer compatibility outputs validate with `scripts/validate-project-skill.mjs`.
- Refresh preserves content inside `BEGIN USER RULES` blocks.
- Adapter outputs stay concise and platform-appropriate.

## Functional Skill Prompt

```text
Use ai-skill-maker to create a functional Codex skill for making presentation decks.

Interview me first. Start with my comfortable language and locale profile, then ask for concrete examples, inputs, outputs, reusable resources, validation expectations, and safety boundaries. Generate the skill into ./generated/presentation-maker and validate it.
```

## Document Skill Prompt

```text
Use ai-skill-maker to create a Markdown report generation skill.

The skill should help future agents turn notes, repository evidence, and source documents into structured Markdown reports. Ask enough questions to define triggers, report structure, source attribution, language preferences, and verification. Generate the skill into ./generated/markdown-report-maker and validate it.
```

## Workflow Skill Prompt

```text
Use ai-skill-maker to create a workflow automation skill for drafting release notes from repository changes.

Make the skill conservative about publishing, tagging, and unsupported claims. Include approval points, failure handling, validation guidance, and forward-test prompts. Generate the skill into ./generated/release-note-workflow and validate it.
```

## Existing Skill Refresh Prompt

```text
Use ai-skill-maker to refresh the existing skill at ./some-existing-skill.

Scan SKILL.md, agents/openai.yaml, references, assets, scripts, examples, and adapter files first. Preserve every user-authored rule inside BEGIN USER RULES blocks. Update observed facts only when source files support the change. Run validation after refresh and report which files changed.
```

## Project Maintainer Compatibility Prompt

```text
Use ai-skill-maker to create a maintainer skill for this existing repository.

First scan README, docs, package metadata, scripts, CI, tests, lockfiles, generated-file signals, and existing assistant instruction files. Then ask only the follow-up questions needed to capture future maintenance goals and language preferences. Render the maintainer skill into ./generated/repo-maintainer and validate it.
```

## Adapter Prompt

```text
Use ai-skill-maker to create platform-neutral guidance, then render adapter outputs for AGENTS.md, CLAUDE.md, Cursor rules, and GitHub Copilot instructions.

Keep adapter outputs concise. Put durable knowledge in the full skill references when a full skill exists, and make each adapter point future agents toward the deeper source of truth.
```

## Result Notes Template

```text
Test:
Date:
Model/session:
Target skill or project:
Mode selected:
Questions asked:
Generated path:
Validation commands:
Validation result:
Evidence quality:
Preserved user rules:
Adapter outputs:
Issues found:
Recommended follow-up:
```
