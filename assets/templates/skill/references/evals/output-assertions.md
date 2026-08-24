# {{displayName}} Output Assertions

Each assertion describes one observable property of the skill's final output.
An assertion is objective when a verifier can check it without relying on
subjective judgment. Keep assertions to facts that change how the user judges
the result.

| # | Assertion | How to verify | Evidence |
| --- | --- | --- | --- |
| 1 | {{outputAssertion}} | {{verificationMethod}} | |
| 2 | {{outputAssertion}} | {{verificationMethod}} | |
| 3 | {{outputAssertion}} | {{verificationMethod}} | |

## Grading

For each run of the skill, mark each assertion as `pass`, `fail`, or `not
evaluated`. A release-ready skill has all assertions passing on the most recent
run, or an explicit waiver recorded for the failed one.

## Evidence rule

Structure existing, fields complete, or scripts passing prove only that
structure. They do not prove the user received the desired result. Record the
actual artifact produced, not the internal steps taken.

## Evidence Ledger

 - recommended_standard: assertions should be objective and verifiable without subjective judgment.
 - declared_intent: the skill owner defines which output properties matter.

<!-- BEGIN USER RULES -->
<!-- Add durable output-assertion rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
