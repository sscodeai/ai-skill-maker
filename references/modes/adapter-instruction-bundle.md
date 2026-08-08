# Adapter Instruction Bundle Mode

Use this mode when the user wants assistant instructions without a full skill folder, or wants a full skill plus platform-specific instruction files.

## Targets

- `AGENTS.md`
- `CLAUDE.md`
- `.cursor/rules/*.mdc`
- `.github/copilot-instructions.md`
- Codex skill folders

## Guidance

- Treat the full generated skill or references as the canonical source when both full and adapter outputs exist.
- Keep adapter outputs concise and platform-appropriate.
- Preserve marked generated blocks on refresh.
- Refuse to overwrite non-empty unmarked adapter files unless the user explicitly chooses force replacement.
- Avoid long evidence ledgers in adapter files unless the user asks for repo-local instructions only.
