# {{displayName}} Trigger Tests

Each row is a request the {{skillName}} skill should either accept (trigger) or
reject (no-trigger). Run these through a fresh session of the target agent and
record the outcome.

| Request | Expected trigger | Outcome (pass/fail) | Notes |
| --- | --- | --- | --- |
| {{triggerExample}} | yes | | |
| {{triggerExample}} | no | | |
| {{triggerExample}} | yes | | |

## How to run

For each row, start a new session with no prior context, paste the request, and
observe whether the skill activates. Record the outcome in the table. A row that
fails is a trigger bug: either the description is too narrow (missed trigger) or
too broad (false trigger).

## Evidence rule

Do not claim the skill is trigger-clean until every row has been run in a fresh
session and the outcome recorded. A fresh context only proves no inherited
conversation; it cannot alone prove a fix works.

## Evidence Ledger

 - recommended_standard: trigger tests should run in a fresh session with no prior context.
 - declared_intent: the skill owner decides which requests are in or out of scope.

<!-- BEGIN USER RULES -->
<!-- Add durable trigger-test rules here. This block is preserved on refresh. -->
<!-- END USER RULES -->
