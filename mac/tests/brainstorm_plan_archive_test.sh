#!/usr/bin/env bash
set -euo pipefail

test_root=$(mktemp -d)
trap 'rm -rf "$test_root"' EXIT

config_repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
helper="$config_repo/mac/brainstorm_plan_archive.sh"
source_repo="$test_root/source"
archive_remote="$test_root/archive.git"
archive_clone="$test_root/archive"
sync_state="$test_root/state"

git init --bare "$archive_remote" >/dev/null
git init "$source_repo" >/dev/null
git -C "$source_repo" remote add origin git@github.com:sample-owner/sample-repo.git

export BRAINSTORM_PLAN_ARCHIVE_DIR="$archive_clone"
export BRAINSTORM_PLAN_ARCHIVE_REMOTE="$archive_remote"
export BRAINSTORM_PLAN_SYNC_STATE_DIR="$sync_state"
export CODEX_THREAD_ID="thread-one"
export GIT_AUTHOR_NAME="Archive Test"
export GIT_AUTHOR_EMAIL="archive@example.com"
export GIT_COMMITTER_NAME="$GIT_AUTHOR_NAME"
export GIT_COMMITTER_EMAIL="$GIT_AUTHOR_EMAIL"

first_path=$("$helper" path "$source_repo" 2026-07-27-sample-feature)
expected="$archive_clone/sample-repo/sample-owner/docs/2026-07-27-sample-feature.md"
test "$first_path" = "$expected"

mkdir -p "$(dirname "$first_path")"
printf '# First plan\n' > "$first_path"
second_path=$("$helper" path "$source_repo" 2026-07-27-sample-feature)
test "$second_path" = "$archive_clone/sample-repo/sample-owner/docs/2026-07-27-sample-feature-2.md"
printf '# Second plan\n' > "$second_path"

"$helper" sync-once
first_remote_count=$(git --git-dir="$archive_remote" rev-list --count --all)
test "$first_remote_count" -eq 1

printf '# Changed after sync\n' >> "$first_path"
"$helper" sync-once
second_remote_count=$(git --git-dir="$archive_remote" rev-list --count --all)
test "$second_remote_count" -eq 1

export CODEX_THREAD_ID="thread-two"
"$helper" sync-once
third_remote_count=$(git --git-dir="$archive_remote" rev-list --count --all)
test "$third_remote_count" -eq 2

printf '# Pending after failed push\n' >> "$second_path"
mv "$archive_remote" "$archive_remote.offline"
export CODEX_THREAD_ID="thread-three"
"$helper" sync-once
failed_push_local_count=$(git -C "$archive_clone" rev-list --count HEAD)
test "$failed_push_local_count" -eq 3
mv "$archive_remote.offline" "$archive_remote"
failed_push_remote_count=$(git --git-dir="$archive_remote" rev-list --count --all)
test "$failed_push_remote_count" -eq 2

"$helper" sync-once
same_thread_remote_count=$(git --git-dir="$archive_remote" rev-list --count --all)
test "$same_thread_remote_count" -eq 2

export CODEX_THREAD_ID="thread-four"
"$helper" sync-once
recovered_remote_count=$(git --git-dir="$archive_remote" rev-list --count --all)
test "$recovered_remote_count" -eq 3

https_repo="$test_root/https-source"
git init "$https_repo" >/dev/null
git -C "$https_repo" remote add origin https://github.com/another-owner/another-repo.git
https_path=$("$helper" path "$https_repo" 2026-07-27-https)
test "$https_path" = "$archive_clone/another-repo/another-owner/docs/2026-07-27-https.md"

printf 'brainstorm plan archive tests passed\n'
