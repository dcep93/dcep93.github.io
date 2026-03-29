#!/bin/zsh
set -euo pipefail

json="$1"

event_type="$(/usr/bin/python3 -c 'import json,sys; print(json.loads(sys.argv[1]).get("type",""))' "$json")"
msg="$(/usr/bin/python3 -c 'import json,sys; print(json.loads(sys.argv[1]).get("last-assistant-message",""))' "$json")"

[[ "$event_type" == "agent-turn-complete" ]] || exit 0

skip_notification="$(
	/usr/bin/python3 -c '
import json
import sys

try:
    parsed = json.loads(sys.argv[1])
except json.JSONDecodeError:
    print("0")
    raise SystemExit

print(
    "1"
    if isinstance(parsed, dict)
    and set(parsed.keys()) == {"title"}
    and isinstance(parsed["title"], str)
    else "0"
)
	' "$msg"
)"

[[ "$skip_notification" == "1" ]] && exit 0

msg="${msg:-Turn complete}"
msg="${msg//$'\n'/ }"
msg="${msg:0:140}"

echo "$json" >/tmp/last_codex_turn.txt
echo "$msg" >>/tmp/last_codex_turn.txt

/opt/homebrew/bin/terminal-notifier \
	-title "Codex.VSCode" \
	-message "x:$msg" \
	-activate "com.microsoft.VSCode"
