# Existing Skill Scan

Use this checklist when refreshing or generalizing an existing AI skill.

## Files to Inspect

- `SKILL.md`
- `agents/openai.yaml`
- `references/`
- `assets/`
- `scripts/`
- README or repository docs when the skill lives in a repo
- tests, fixtures, examples, and validation scripts
- adapter files such as `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, and `.github/copilot-instructions.md`

## Signals to Extract

- skill name, description, trigger conditions, and default prompt
- supported tasks and examples
- required tools, runtimes, dependencies, and environment assumptions
- reusable references, templates, fixtures, or scripts
- validation commands and known failure modes
- generated files and edit restrictions
- user-authored preservation blocks
- adapter outputs and canonical source statement

## Follow-Up Questions

- Which current behaviors are correct and should be preserved?
- Which tasks should the refreshed skill support next?
- Which platforms should be emitted or kept in sync?
- Which language and locale should guide interviews, references, and public instructions?
- Which scripts or assets are trusted source material versus generated output?

## Refresh Rules

- Do not overwrite user-authored sections.
- Treat existing files as observed facts when citing them.
- Keep inferred assumptions narrow and easy to revise.
- Report any file that cannot be refreshed safely.
