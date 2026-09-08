# Codex Default Model and Direct Push Design

## Purpose

Make GPT-6 Astra the checked-in default Codex model and establish direct
default-branch delivery as the normal repository workflow.

## Changes

### `mac/codex_config.toml`

Set the top-level `model` value to `gpt-6-astra`. Preserve every other
uncommitted configuration change and stage only the requested model change.

### `mac/codex/AGENTS.md`

Add a repository-update policy stating that, unless the user says otherwise,
content changes are made directly on the checked-out default branch (`main` or
`master`), committed, and pushed without requiring a separate deploy or push
instruction. Feature branches and worktrees are not created by default.

The policy will retain normal safety checks: preserve unrelated working-tree
changes, stage only task-owned changes, and report genuine divergence,
conflicts, branch protection, or other blockers instead of forcing a push.

## Delivery

Commit directly to the current `master` branch and push `origin/master`. This
also publishes the 18 existing local commits by which `master` currently leads
`origin/master`, as explicitly approved by the user.

## Verification

- Parse the TOML successfully and confirm the default model value.
- Inspect the staged diff to ensure unrelated configuration settings remain
  unstaged.
- Confirm the instruction file contains the direct-commit-and-push default and
  its safety boundaries.
- Confirm local `master` and `origin/master` resolve to the same commit after
  pushing.
