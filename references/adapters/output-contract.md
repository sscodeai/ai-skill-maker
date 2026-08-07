# Adapter Output Contract

Use this contract when emitting non-default assistant instruction formats.

## Shared Requirements

Every adapter output should include:

- Project purpose and maintenance posture.
- Key paths and edit-careful/generated files.
- Coding or content standards relevant to the target assistant.
- Verification commands and manual QA expectations.
- Evidence distinction when space allows.
- A clear statement of which source is canonical when multiple instruction files exist.

Adapter outputs should be concise. Preserve full evidence ledgers and detailed maps in the generated project maintainer skill references unless the user requests repo-local instructions only.

## Format Expectations

- `AGENTS.md`: repo-native agent guidance with build/test/edit rules and generated-file cautions.
- `CLAUDE.md`: concise Claude-oriented project guidance without Codex-specific workflow language.
- `.cursor/rules/*.mdc`: short focused rules split by scope or stack.
- `.github/copilot-instructions.md`: repository-wide Copilot coding instructions with project context, style, and verification guidance.
- Codex skill: full skill folder with `SKILL.md`, `agents/openai.yaml`, references, and optional scripts.

## Preservation

When refreshing adapter outputs:

- Preserve user-authored sections if markers exist.
- Prefer regenerating clearly machine-owned sections.
- Refuse to overwrite non-empty adapter files that do not contain maker markers unless the user explicitly chooses a force replace operation.
- Report any adapter output that could not be refreshed safely.
