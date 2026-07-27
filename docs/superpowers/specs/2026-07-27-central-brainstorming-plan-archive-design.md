# Central Brainstorming Plan Archive Design

## Goal

Store generated implementation plans in one private Git repository so they are durable, versioned, searchable, and viewable from multiple devices without adding plans to each source repository.

## Archive

Create the private GitHub repository `dcep93/brainstorming-plans` and clone it at:

```text
$HOME/repos/brainstorming-plans
```

Plans use this layout:

```text
<repo>/<owner>/docs/YYYY-MM-DD-<feature-name>.md
```

For example:

```text
dcep93.github.io/dcep93/docs/2026-07-27-central-brainstorming-plan-archive.md
```

The source repository's `origin` remote supplies `owner` and `repo`. The repository name intentionally precedes the owner. Strip a trailing `.git` before constructing the path.

If the target filename already exists, preserve it and append the first available numeric suffix: `-2`, `-3`, and so on. Never overwrite an archived plan.

## Workflow Integration

Add a small shell helper in the personal configuration repository and invoke it through the authoritative brainstorm patch.

The helper has two responsibilities:

1. Resolve the absolute archive path for a source repository and plan filename. On first use in a Codex task, ensure the archive clone exists and make one best-effort update from its remote.
2. Synchronize the archive at most once per Codex task. Stage accumulated plans, create at most one commit, and make exactly one best-effort push attempt.

`CODEX_THREAD_ID` identifies the Codex task. A per-task marker prevents a second synchronization attempt even if the workflow reaches the helper again. The marker is written before Git synchronization starts, so failures are not retried during the same task.

The brainstorm patch overrides the upstream `writing-plans` default location with the helper's returned path. The existing plan format and self-review requirements remain unchanged.

## Data Flow

1. Brainstorming produces and approves a design specification.
2. Before `writing-plans` writes a plan, the workflow asks the helper for an archive path.
3. The helper derives `<repo>/<owner>` from the source repository's `origin`, updates or clones the private archive on the task's first path request, and returns a collision-safe Markdown path.
4. `writing-plans` writes and self-reviews the plan at that path.
5. The workflow invokes archive synchronization.
6. The helper stages all accumulated archive changes, commits them once, and attempts one push.
7. With `yesi`, the workflow links the archived plan in commentary and immediately starts implementation.

Plans created after the task's synchronization attempt remain local and are picked up by a later task. A later successful push also publishes commits left unpushed by an earlier failed attempt.

## Failure Handling

- If the archive clone is absent, clone `git@github.com:dcep93/brainstorming-plans.git`.
- If the initial fetch or pull fails, warn and continue using the local clone.
- If the source repository has no parseable GitHub `origin`, stop before writing the plan and report the unsupported remote. Do not guess an owner.
- If commit or push fails, warn and leave all local files and commits intact. Do not retry within the same Codex task.
- If the archive is already synchronized in the current task, return success without running another commit or push.
- Archive failures do not block implementation after a valid plan has been written locally.

## Existing Plan Migration

Copy every existing Markdown file beneath a `docs/superpowers/plans` directory under `$HOME/repos` into the archive. Determine each file's source repository from its nearest enclosing Git worktree, then map it to `<repo>/<owner>/docs/`.

Migration is non-destructive: verify copied files byte-for-byte and leave source files in place. Apply the same numeric collision rule if two source files map to one archive path.

The current inventory contains 40 plans:

- 33 from `lottaendgames`
- 5 from `firegame`
- 1 from `dcep93.github.io`
- 1 from `chess420`

The `chess420` plan lives under `app/docs`, but its enclosing Git worktree and origin correctly map it to `chess420/dcep93`.

## Testing

Add a shell test that uses temporary source, archive, and bare-remote repositories. Verify:

- SSH and HTTPS GitHub origins map to `<repo>/<owner>/docs`.
- Existing filenames receive monotonically increasing numeric suffixes.
- synchronization creates and pushes a commit;
- a second synchronization call with the same `CODEX_THREAD_ID` performs no commit or push;
- a later task can push a commit left behind by an earlier failed push.

After migration, compare the archived files with their source files and confirm all 40 source plans have corresponding byte-identical archive copies.

Finally, verify through GitHub that `dcep93/brainstorming-plans` is private and that the initial archive commit is present.

