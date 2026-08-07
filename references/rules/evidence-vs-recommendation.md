# Evidence vs Recommendation

Maintain strict provenance in generated project skills.

## Labels

- `observed_fact`: Evidence from files, command output, metadata, CI, tests, scripts, generated artifacts, or commit/style signals.
- `declared_intent`: User-provided goals, constraints, preferences, public positioning, or future direction.
- `recommended_standard`: A norm selected by this skill because it fits the stack, project maturity, or maintenance goal.
- `inferred_assumption`: A cautious assumption from incomplete information.

## Rules

- Never present an inferred assumption as a fact.
- Prefer citing paths for observed facts: `README.md`, `package.json`, `.github/workflows/ci.yml`.
- If a claim came from command output, cite the command and the relevant file when possible.
- Keep recommendations actionable and scoped. Explain why they fit the project type.
- Use declared intent to override recommendations, not observed facts.
- On refresh, preserve user blocks even when generated recommendations change.

## Recommended Evidence Ledger Format

```markdown
## Evidence Ledger

- observed_fact: `package.json` defines `npm run build` as the production build command.
- declared_intent: The maintainer wants docs to be written in Japanese with English API names.
- recommended_standard: For TypeScript OSS, keep exported APIs typed and covered by tests.
- inferred_assumption: Because no release workflow exists, releases are likely manual for now.
```
