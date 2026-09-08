# Workspace File-Creation Policy

Do not create files or directories anywhere under `~/repos`, except for the
following:

- You may clone Git repositories into `~/repos`.
- You may do normal work inside Git repositories under `~/repos`, including
  creating files and directories within those repositories.
- You may create `~/repos/_codex_output` and create output data anywhere within
  that directory.

## Response Formatting

- Begin the final response with `bug identified` only when that response newly identifies a user-relevant bug. Do not use the prefix when fixing a bug identified in an earlier response or for an incidental bug introduced and resolved during implementation.

## Repository Update Defaults

- When updating content in a Git repository, unless the user says otherwise,
  work directly on its checked-out default branch (`main` or `master`), commit
  the completed task-owned changes, and push that branch. Do not require a
  separate deploy or push instruction.
- Do not create a feature branch or worktree by default. Use one only when the
  user explicitly requests it or direct work on the default branch is not
  possible.
- Preserve unrelated working-tree changes and stage only task-owned changes.
  If divergence, conflicts, branch protection, or another genuine blocker
  makes a safe direct push impossible, report the blocker instead of forcing
  it.
