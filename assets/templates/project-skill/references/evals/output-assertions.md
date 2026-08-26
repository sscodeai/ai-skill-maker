# {{projectDisplayName}} Output Assertions

Each assertion describes one observable property of the skill's final output.
An assertion is objective when a verifier can check it without relying on
subjective judgment. Keep assertions to facts that change how the maintainer
judges the result.

| # | Assertion | How to verify | Evidence |
| --- | --- | --- | --- |
| 1 | The response cites the relevant project references or source files used for the change. | Inspect the final response and changed files. | |
| 2 | The change follows the existing project style and ownership boundaries. | Compare against `references/project-map.md` and the touched files. | |
| 3 | Verification commands or explicit reasons they could not run are reported. | Inspect the final response for command outcomes. | |

## Grading

For each run of the skill, mark each assertion as `pass`, `fail`, or `not
evaluated`. A release-ready skill has all assertions passing on the most recent
run, or an explicit waiver recorded for the failed one.

## Evidence rule

Structure existing, fields complete, or scripts passing prove only that
structure. They do not prove the maintainer received the desired result. Record
the actual artifact produced, not the internal steps taken.

## Evidence Ledger

- recommended_standard: assertions should be objective and verifiable without subjective judgment.
- declared_intent: the skill owner defines which maintainer-output properties matter.

<!-- BEGIN USER RULES -->
<!-- Add durable project output-assertion rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
