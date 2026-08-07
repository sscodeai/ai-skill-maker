# Quality Gate

Before delivering a generated project maintainer skill:

- Validate the rendered output directory, not the raw `assets/templates/project-skill` template.
- Required files exist.
- `SKILL.md` frontmatter has only `name` and `description`.
- `agents/openai.yaml` has quoted interface strings.
- Reference files include an `Evidence Ledger`.
- Manual preservation blocks exist in generated Markdown files.
- Observed facts cite source paths when repo evidence exists.
- Generated instructions are actionable for future AI-assisted maintenance.
- Verification commands are concrete or clearly marked as recommendations/assumptions.
- Generated files and edit restrictions are documented.
- Refresh did not remove content inside `BEGIN USER RULES` blocks.
- For maker changes, run at least one forward-test prompt from `references/evals/forward-tests.md` when the change affects mode selection, interviews, rendering, refresh, validation, or adapters.

Run:

```bash
node scripts/validate-project-skill.mjs <output-skill-dir>
```

For Codex skill compatibility, optionally run the skill-creator validator after installing `PyYAML` in the Python environment:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py <output-skill-dir>
```
