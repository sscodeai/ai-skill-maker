# TypeScript and Node OSS Standards

Use for TypeScript libraries, Node CLIs, OSS packages, and typed app/tooling projects.

## Recommended Standards

- Prefer the repo's existing package manager and lockfile.
- Preserve public API compatibility unless the user requests a breaking change.
- Keep exported types explicit and stable.
- Add or update focused tests for behavior changes.
- Run typecheck, lint, tests, and build when available.
- Avoid dependency additions unless they remove real complexity or match project policy.
- Document user-visible changes in README, docs, changelog, or release notes as appropriate.

## Signals

Look for:

- `package.json` `type`, `exports`, `bin`, `scripts`, and dependency fields.
- `tsconfig*.json`
- Test runners such as Vitest, Jest, Playwright, Node test runner, or uvu.
- Lint/format configs.
- Release tools such as Changesets, semantic-release, release-it, or npm scripts.

## Verification Recommendations

- Use exact package scripts from the repo.
- If no full test suite exists, run targeted tests or `npm pack --dry-run` for packages.
- For CLI changes, run the built or source CLI against a small fixture.
