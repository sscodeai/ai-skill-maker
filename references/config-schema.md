# Config Schema

AI Skill Maker has two render config families.

## General Skill Configs

Use `references/skill-config-schema.md` for outputs rendered with:

```bash
node scripts/render-skill.mjs --input config.json --output <skill-dir> --strict
node scripts/render-skill.mjs --print-schema
```

Validate configs with:

```bash
node scripts/validate-skill-config.mjs --input config.json --mode functional --strict
```

## Project Maintainer Compatibility Configs

Use `references/project-config-schema.md` for compatibility outputs rendered with:

```bash
node scripts/render-project-skill.mjs --input config.json --output <skill-dir> --strict
node scripts/render-project-skill.mjs --print-schema
```

Validate configs with:

```bash
node scripts/validate-config.mjs --input config.json --mode repo --strict
```

## Evidence Labels

Both config families use:

- `observed_fact`: cite files, command output, existing skill assets, source repo paths, or metadata when available.
- `declared_intent`: cite the maker interview or maintainer statement.
- `recommended_standard`: cite the selected standard or explain the fit.
- `inferred_assumption`: keep narrow and easy to revise.
