# Project Maintainer Skill Mode

Use this mode when the generated skill should help future agents maintain a specific software project.

This mode preserves the original `ai-project-skill-maker` capability as a subtype of AI Skill Maker.

## Mode Routing

- Use `references/modes/genesis.md` when the project is new or has little repository evidence.
- Use `references/modes/repo.md` when an existing repository can be scanned.
- Use `references/workflows/refresh.md` when updating an existing maintainer skill.

## Output Guidance

Use the compatibility project-maintainer renderer and validator until the generalized skill renderer fully covers this mode:

```bash
node scripts/render-project-skill.mjs --input config.json --output <skill-dir> --strict
node scripts/validate-project-skill.mjs <skill-dir>
```

Keep observed facts tied to source paths and preserve all user-authored rule blocks on refresh.
