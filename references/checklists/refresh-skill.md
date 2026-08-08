# Refresh Skill Checklist

Use this checklist before updating an existing generated skill or instruction bundle.

## Before Editing

- Identify the canonical source: full skill folder, config file, repo docs, or adapter file.
- Locate all `BEGIN USER RULES` and generated-block markers.
- Determine whether target files are marked for safe refresh.
- Scan changed source files, examples, scripts, references, and adapter outputs.
- Ask what user-authored behavior must be preserved.

## During Refresh

- Preserve content inside user blocks exactly.
- Replace only machine-owned sections unless the user explicitly asks for broader changes.
- Update observed facts only when supported by evidence.
- Keep declared intent separate from recommendations.
- Add new assumptions only when necessary and easy to revisit.

## After Refresh

- Run the relevant validator.
- Run any deterministic scripts or health checks.
- If adapters were emitted, confirm marked refresh behavior and avoid unmarked overwrite.
- Report changed files, preserved blocks, validation result, and remaining assumptions.
