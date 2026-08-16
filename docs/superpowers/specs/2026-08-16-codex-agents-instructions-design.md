# Codex Workspace Agent Instructions Design

## Purpose

Add a canonical Codex filesystem policy and make it apply from the root of
`~/repos` without duplicating the policy text.

## Files

### `mac/codex/AGENTS.md`

This is the canonical policy. It prohibits creating files or directories in
`~/repos`, with three explicit allowances:

- cloning Git repositories into `~/repos`;
- doing normal work inside Git repositories under `~/repos`; and
- creating output data in `~/repos/_codex_output`.

The wording will make clear that the output directory itself may be created.

### `~/repos/AGENTS.md`

This root instruction file points agents to
`~/repos/dcep93.github.io/mac/codex/AGENTS.md` and requires adherence to it.
Keeping the policy in one canonical file avoids drift.

## Verification

After creation, read both files from disk and confirm that the root file points
to the canonical policy and that all requested restrictions and exceptions are
present.
