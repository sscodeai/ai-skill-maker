# Trust Gate

Run this gate before generating, refreshing, or publishing any skill. Trust is
a HARD gate: strong prose or a high score cannot compensate for an unsafe
permission, sensitive-data leakage, an opaque dependency, or an unfit
environment. One `BLOCK` stops the work until the issue is resolved.

## Checks

| Check | Ask | Result (PASS/BLOCK) | Evidence |
| --- | --- | --- | --- |
| Permissions | Does the skill request only the permissions the workflow actually needs? Any `--force`, destructive, or irreversible operations? | | |
| Sensitive data | Does the skill read, write, or transmit credentials, tokens, private keys, personal data, or customer data? Are secrets kept out of generated files and logs? | | |
| Dependencies | Are runtime dependencies declared, versioned, and justified? Any opaque or unverifiable dependency? | | |
| Environment | Is the assumed environment (OS, runtimes, network, services) explicit and fit for the target user? | | |
| External actions | Does the skill send email, publish, pay, create remote repos, change visibility, force-push, or delete files? Those require separate user permission. | | |
| Rollback | If the skill modifies user-owned files, is the change reversible or backed up? | | |

## Rules

- One BLOCK means STOP. Do not continue to generation.
- Fix the root cause of the BLOCK, not the wording of the gate.
- If a permission is genuinely required but risky, require explicit user
  confirmation at the point of use — not a blanket allowance in the skill.
- Never claim a skill is trusted without running this gate and recording the
  evidence.

## Evidence Ledger

- recommended_standard: trust is a hard gate; prose and scores do not compensate for unsafe permissions, leakage, opaque dependencies, or unfit environments.
- declared_intent: the skill owner decides what risk level is acceptable for their audience.

<!-- BEGIN USER RULES -->
<!-- Add durable trust-gate rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
