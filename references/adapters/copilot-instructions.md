# Copilot Instructions Adapter

Use when the user wants GitHub Copilot repository instructions.

## Output Path

Emit:

```text
.github/copilot-instructions.md
```

## Mapping

Include:

- Project purpose and audience.
- Stack, key paths, and architecture summary.
- Coding standards and dependency policy.
- Documentation/content style when relevant.
- Generated files and edit restrictions.
- Verification commands and manual QA expectations.
- Release or changelog cautions when relevant.

## Style

- Keep instructions concise and repository-wide.
- Use direct imperatives.
- Avoid tool-specific commands unless they are repository commands.
- Prefer current observed repo behavior over aspirational recommendations.
- Mention open assumptions only when they materially affect coding decisions.

## Caution

Do not include long evidence ledgers in `.github/copilot-instructions.md`. Keep full provenance in the project maintainer skill references.
