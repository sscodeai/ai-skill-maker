# Codex Skill Adapter

Default adapter. Emit a valid Codex skill folder.

## Requirements

- Folder name equals the `name` field in `SKILL.md`.
- `SKILL.md` frontmatter includes only `name` and `description`.
- Keep detailed project rules in `references/`.
- Include `agents/openai.yaml`.
- Use scripts only for deterministic repeated checks, such as `scripts/health-check.mjs`.

## Invocation Prompt

Use:

```text
Use $<skill-name> to make a well-verified change to this project.
```
