# {{displayName}} Release Gate

Run this checklist before sharing or publishing the {{skillName}} skill. A gate
is `BLOCK` or `ALLOW`; there is no partial state. A `BLOCK` means the skill is
not ready for the claimed audience.

| Gate | Check | Result (BLOCK/ALLOW) | Evidence |
| --- | --- | --- | --- |
| Trigger | Every row in `references/evals/trigger-tests.md` passes in a fresh session | | |
| Output | Every assertion in `references/evals/output-assertions.md` passes on the most recent run | | |
| Structure | `validate-skill-output.mjs` (or the equivalent validator) passes | | |
| Budget | Active Markdown instruction files stay within the file budget | | |
| Trust | No unsafe permissions, sensitive-data leakage, opaque dependencies, or unfit environment | | |
| License | Third-party code, templates, examples, or assets retain their licenses and attribution | | |

## Rules

- A file existing, a structural check passing, and a user receiving the desired
  result are different levels of evidence. Report only what was actually
  checked.
- Missing evidence is `BLOCK`, not `ALLOW`. Never fabricate evidence.
- Do not claim publication, installation, marketplace registration, or
  benchmark quality without evidence.
- High-risk actions (creating a remote repository, changing visibility,
  force-pushing, deleting files) require separate user permission.

## Evidence Ledger

 - recommended_standard: release gates are BLOCK/ALLOW with recorded evidence, never partial.
 - declared_intent: the skill owner decides the release audience and gate strictness.

<!-- BEGIN USER RULES -->
<!-- Add durable release-gate rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
