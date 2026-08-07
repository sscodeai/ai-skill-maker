# Forward Tests

Use these prompts to test whether AI Skill Maker can create useful maintainer guidance without relying on hidden context from its own implementation work.

## How To Run

- Run forward tests in a fresh AI session when possible.
- Provide only the prompt, the target repository or stated project intent, and ordinary user constraints.
- Do not provide expected answers, known bugs, implementation notes, or prior review findings unless a test explicitly asks for them.
- Save raw outputs, rendered files, validation logs, and any follow-up questions asked by the agent.
- Judge whether the generated maintainer skill would help a future agent maintain the project, not whether it perfectly mirrors this repository.

## Evaluation Criteria

- The agent selects genesis mode, repo mode, or refresh workflow correctly.
- Genesis mode asks language and locale questions before deeper project planning.
- Repo mode scans repository evidence before asking follow-up questions.
- Claims are separated into `observed_fact`, `declared_intent`, `recommended_standard`, and `inferred_assumption`.
- Repo-mode `observed_fact` entries cite source paths where practical.
- Output keeps detailed durable guidance in `references/`, not only in generated `SKILL.md`.
- Rendered project maintainer skill validates with `scripts/validate-project-skill.mjs`.
- Refresh preserves content inside `BEGIN USER RULES` blocks.
- Adapter outputs stay concise and platform-appropriate.

## Genesis Mode Prompt

```text
Use ai-skill-maker to create a maintainer instruction bundle for a new documentation-heavy developer tool project.

The project does not have a repository yet. I want the agent to interview me first, including my comfortable language and locale profile, then generate a day-one maintainer skill. The eventual project will probably use Astro, TypeScript, Markdown/MDX, and a lightweight OSS maintenance posture.

Do not assume repository facts. Separate declared intent, recommended standards, and inferred assumptions. Generate the project maintainer skill into ./generated/new-docs-maintainer and run validation.
```

## Repo Mode Prompt

```text
Use ai-skill-maker to create a maintainer skill for this existing repository.

First scan the repository for README, docs, package metadata, scripts, CI, tests, lockfiles, generated-file signals, and existing assistant instruction files. Then ask only the follow-up questions needed to capture future maintenance goals and language preferences.

Render the maintainer skill into ./generated/repo-maintainer, validate the rendered output directory, and summarize the evidence sources you used.
```

## Refresh Workflow Prompt

```text
Use ai-skill-maker to refresh the existing maintainer skill at ./generated/repo-maintainer after repository changes.

Preserve every user-authored rule inside BEGIN USER RULES blocks. Update observed facts only when the repository evidence supports the change. Run validation after refresh and report which files changed.
```

## Adapter Prompt

```text
Use ai-skill-maker to create platform-neutral maintainer guidance for this repository, then render adapter outputs for AGENTS.md, CLAUDE.md, Cursor rules, and GitHub Copilot instructions.

Keep adapter outputs concise. Put durable project knowledge in the maintainer references, and make each adapter point future agents toward the deeper source of truth.
```

## Result Notes Template

```text
Test:
Date:
Model/session:
Target repo or project:
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
