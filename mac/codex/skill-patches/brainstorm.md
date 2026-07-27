# Brainstorm Skill Patches

Apply these instructions as authoritative overrides to the upstream brainstorm skill.

## Approval shortcuts

When asking `Approve this design?`, always render the prompt exactly as:

> Approve this design? `yesi/rf`

Interpret replies case-insensitively after trimming surrounding whitespace:

- **`yesi`** — Approve the current design and every remaining design, written-spec, planning, and implementation approval checkpoint for the current task during the same assistant turn. Complete all required design, documentation, self-review, planning, and verification work without pausing at those approval checkpoints. Carry this authorization into downstream planning and implementation workflows. Brainstorming itself must still transition through writing-plans rather than invoking an implementation skill directly.
- **`read final` or `rf`** — Approve all remaining section-by-section design checkpoints and continue through writing and self-reviewing the design document. Then pause at the written Markdown spec for final approval. Do not invoke writing-plans or begin implementation before that approval.

These shortcuts skip approval pauses, not required work. They do not bypass safety checks, permission requirements, destructive-action confirmations, or questions whose answers are necessary to avoid materially changing the user's intent. Do not carry shortcut authorization into a later user turn or an unrelated task.

### Live plan handoff after `yesi`

After writing and self-reviewing the implementation plan, send a commentary progress update that links to the saved Markdown plan and states that implementation is starting. This update is informational, not an approval checkpoint: immediately begin the appropriate implementation workflow in the same assistant turn without waiting for another response or asking the writing-plans execution-choice question.

The user may read the plan while implementation proceeds. If the user interrupts or sends a correction, treat the newer instruction as authoritative and adjust or stop the work as appropriate.

## Visual companion consent

Treat consent to use the visual companion as already granted. Do not ask for consent or send the old opt-in prompt. When upcoming questions involve visual content, read the skill's `visual-companion.md`, start the local companion only when a specific question benefits from visual treatment, and tell the user the local URL when it is ready. Continue deciding per question whether a browser visual or terminal text is clearer.

## Generated implementation plans

Before invoking writing-plans, ensure `docs/superpowers/plans/.gitignore` exists in the current project with:

```gitignore
*
!.gitignore
```

Include that `.gitignore` with the design-document commit when it is created or changed. Never commit generated plan files under `docs/superpowers/plans/`.
