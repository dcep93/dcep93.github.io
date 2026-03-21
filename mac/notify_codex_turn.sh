#!/bin/zsh
set -euo pipefail

json="$1"

event_type="$(printf '%s' "$json" | /usr/bin/python3 -c 'import sys,json; print(json.load(sys.stdin).get("type",""))')"
msg="$(printf '%s' "$json" | /usr/bin/python3 -c 'import sys,json; print(json.load(sys.stdin).get("last-assistant-message","Turn complete"))')"

[[ "$event_type" == "agent-turn-complete" ]] || exit 0

msg="${msg:-Turn complete}"
msg="${msg//$'\n'/ }"
msg="${msg:0:140}"

/opt/homebrew/bin/terminal-notifier \
  -title "Codex.VSCode" \
  -message "$msg" \
  -activate "com.microsoft.VSCode"
