# Codex Agent Bug Prefix Design

## Goal

Add this response convention to `mac/codex/AGENTS.md` in the `dcep93.github.io` repository:

> Begin the final response with `bug identified` only when that response newly identifies a user-relevant bug. Do not use the prefix when fixing a bug identified in an earlier response or for an incidental bug introduced and resolved during implementation.

## Scope

Keep one bullet in the existing Codex workspace instructions. Preserve the file's current untracked status. The prefix applies to the final diagnostic response that first tells the user a bug exists, not subsequent implementation updates or delivery.

## Verification

Confirm the refined instruction appears once in `dcep93.github.io/mac/codex/AGENTS.md`, covers both exclusions, does not appear in `lottaendgames/AGENTS.md`, and both Markdown files remain valid.
