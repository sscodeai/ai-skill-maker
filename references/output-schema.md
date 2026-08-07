# Output Schema

## Project Maintainer Skill Contract

Generate a complete project maintainer skill folder whose name is a lowercase hyphen-case project skill name. The folder must be usable without this meta-skill after creation.

Required files:

- `SKILL.md`: concise trigger metadata and navigation instructions.
- `agents/openai.yaml`: UI metadata.
- `references/project-intent.md`: product purpose, audience, public voice, constraints, and maintenance goals.
- `references/project-map.md`: important directories, entry points, generated files, and ownership boundaries.
- `references/architecture.md`: system shape, data flow, integration points, and design constraints.
- `references/coding-standards.md`: coding style, dependency policy, patterns to follow, and patterns to avoid.
- `references/content-style.md`: language, tone, docs conventions, naming, examples, and public communication rules.
- `references/workflows.md`: common change workflows and step order.
- `references/verification.md`: test, lint, typecheck, build, preview, manual QA, and risk gates.
- `references/release.md`: versioning, changelog, packaging, deploy, and rollback expectations.
- `references/generated-files.md`: files that are generated, vendored, lockfiles, build outputs, and edit restrictions.
- Optional `scripts/health-check.*`: deterministic project checks that future AI coding agents can run.

## Evidence Blocks

Every reference file should include an `Evidence Ledger` section with bullets using these labels:

- `observed_fact`: supported by repository files, command output, CI config, package metadata, commit history, or other inspectable evidence. Cite source paths where possible.
- `declared_intent`: explicitly provided by the user during the maker session.
- `recommended_standard`: a standard selected by this meta-skill because it fits the project type.
- `inferred_assumption`: a plausible assumption made from partial evidence. Keep it narrow and easy to revise.

Observed facts should cite paths like `package.json`, `README.md`, `.github/workflows/ci.yml`, or `src/lib/foo.ts`.

## Manual Preservation Blocks

Each generated Markdown file must contain exactly one editable user block:

```markdown
<!-- BEGIN USER RULES -->
<!-- Add durable project-specific rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
```

Refresh workflow must preserve the content between markers. Generated content outside the block may be replaced.

## SKILL.md Requirements

The generated `SKILL.md` should:

- Use English core instructions.
- Tell the agent to load only relevant reference files.
- Explicitly require checking `references/generated-files.md` before editing.
- Require verification based on `references/verification.md`.
- Keep detailed standards in references, not inline.

## agents/openai.yaml Requirements

Use:

```yaml
interface:
  display_name: "<Project> Maintainer"
  short_description: "Maintain <project purpose>"
  default_prompt: "Use $<skill-name> to make a well-verified change to this project."
```

Keep strings quoted. Do not add icons or brand color unless the user supplied them.
