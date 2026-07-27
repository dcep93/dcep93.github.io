#!/usr/bin/env bash
set -euo pipefail

archive_dir=${BRAINSTORM_PLAN_ARCHIVE_DIR:-"$HOME/repos/brainstorming-plans"}
archive_remote=${BRAINSTORM_PLAN_ARCHIVE_REMOTE:-"git@github.com:dcep93/brainstorming-plans.git"}
sync_state_dir=${BRAINSTORM_PLAN_SYNC_STATE_DIR:-"${TMPDIR:-/tmp}/brainstorm-plan-archive-state"}

die() {
  printf 'brainstorm-plan-archive: %s\n' "$*" >&2
  exit 1
}

warn() {
  printf 'brainstorm-plan-archive: warning: %s\n' "$*" >&2
}

ensure_archive() {
  if [[ -e "$archive_dir" && ! -d "$archive_dir/.git" ]]; then
    die "archive path exists but is not a Git worktree: $archive_dir"
  fi

  if [[ ! -d "$archive_dir/.git" ]]; then
    mkdir -p "$(dirname "$archive_dir")"
    git clone "$archive_remote" "$archive_dir" >&2 ||
      die "could not clone archive from $archive_remote"
  fi
}

require_thread_id() {
  thread_id=${CODEX_THREAD_ID:-}
  [[ -n "$thread_id" ]] || die "CODEX_THREAD_ID is required"
  [[ "$thread_id" =~ ^[A-Za-z0-9._-]+$ ]] ||
    die "CODEX_THREAD_ID contains unsupported characters"
}

mark_once() {
  marker=$1
  mkdir -p "$sync_state_dir"
  mkdir "$sync_state_dir/$marker" 2>/dev/null
}

update_once() {
  require_thread_id
  if mark_once "$thread_id.pull-attempted"; then
    if ! git -C "$archive_dir" pull --rebase --autostash >&2; then
      warn "archive update failed; continuing with the local clone"
    fi
  fi
}

parse_github_origin() {
  remote=$1

  case "$remote" in
    git@github.com:*)
      remote_path=${remote#git@github.com:}
      ;;
    https://github.com/*)
      remote_path=${remote#https://github.com/}
      ;;
    ssh://git@github.com/*)
      remote_path=${remote#ssh://git@github.com/}
      ;;
    *)
      die "unsupported origin remote: $remote"
      ;;
  esac

  remote_path=${remote_path%.git}
  owner=${remote_path%%/*}
  repo=${remote_path#*/}

  [[ -n "$owner" && -n "$repo" && "$owner" != "$repo" && "$repo" != */* ]] ||
    die "could not derive GitHub owner and repository from: $remote"
}

resolve_path() {
  [[ $# -eq 2 ]] || die "usage: $0 path <source-directory> <plan-stem>"
  source_directory=$1
  plan_stem=$2

  [[ -n "$plan_stem" && "$plan_stem" != */* && "$plan_stem" != "." && "$plan_stem" != ".." ]] ||
    die "plan stem must be a filename without slashes"

  source_root=$(git -C "$source_directory" rev-parse --show-toplevel 2>/dev/null) ||
    die "source directory is not inside a Git worktree: $source_directory"
  origin=$(git -C "$source_root" remote get-url origin 2>/dev/null) ||
    die "source repository has no origin remote: $source_root"
  parse_github_origin "$origin"

  ensure_archive
  update_once

  destination_directory="$archive_dir/$repo/$owner/docs"
  mkdir -p "$destination_directory"

  candidate="$destination_directory/$plan_stem.md"
  suffix=2
  while [[ -e "$candidate" ]]; do
    candidate="$destination_directory/$plan_stem-$suffix.md"
    suffix=$((suffix + 1))
  done

  printf '%s\n' "$candidate"
}

sync_once() {
  [[ $# -eq 0 ]] || die "usage: $0 sync-once"
  require_thread_id
  ensure_archive

  if ! mark_once "$thread_id.sync-attempted"; then
    printf 'brainstorm-plan-archive: synchronization already attempted for %s\n' "$thread_id" >&2
    return 0
  fi

  if ! git -C "$archive_dir" add --all >&2; then
    warn "could not stage archive changes"
  elif ! git -C "$archive_dir" diff --cached --quiet; then
    if ! git -C "$archive_dir" commit -m "docs: archive Codex plans for $thread_id" >&2; then
      warn "archive commit failed; changes remain local"
    fi
  fi

  if ! git -C "$archive_dir" push origin HEAD >&2; then
    warn "archive push failed; a later Codex task can synchronize it"
  fi
}

[[ $# -ge 1 ]] || die "usage: $0 <path|sync-once> ..."
command_name=$1
shift

case "$command_name" in
  path)
    resolve_path "$@"
    ;;
  sync-once)
    sync_once "$@"
    ;;
  *)
    die "unknown command: $command_name"
    ;;
esac
