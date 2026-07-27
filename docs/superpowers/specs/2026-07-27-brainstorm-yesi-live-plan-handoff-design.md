# Brainstorm `yesi` Live Plan Handoff Design

## Goal

Make `yesi` preserve the implementation plan as a readable Markdown artifact while allowing implementation to begin immediately in the same assistant turn.

## Behavior

After `yesi` is accepted, the assistant completes the remaining design, specification, and planning work without pausing. Once the implementation plan has been saved and self-reviewed, the assistant sends a commentary progress update containing a Markdown link to the plan and states that implementation is starting. It then immediately enters the appropriate implementation workflow without asking for another approval or execution-choice response.

The plan update is informational, not a checkpoint. The user can read the plan while work continues and can interrupt or correct the assistant at any time; newer user instructions override the assumed approval.

## Placement

Add a dedicated live-plan handoff subsection to the authoritative brainstorm patch. Keeping the rule beside the existing approval shortcuts makes the behavior apply to downstream planning workflows without modifying the upstream `writing-plans` skill.

## Alternatives Considered

1. Expand only the existing `yesi` bullet. This is compact, but the reporting and no-pause requirements are easy to overlook inside a long definition.
2. Add a dedicated live-plan handoff subsection. This is explicit, testable by inspection, and keeps the shortcut definition readable. This is the selected approach.
3. Patch `writing-plans` globally. This would affect tasks that did not originate from `yesi` and could be overwritten by upstream skill updates.

## Verification

Inspect the patch to confirm that it requires all of the following:

- The saved Markdown plan is linked in a commentary update.
- The update says implementation is starting.
- The update is not an approval checkpoint.
- Implementation starts immediately in the same turn.
- User interruptions or corrections supersede the assumed approval.

