# Codex Native Turn Notifications Design

## Goal

Use the Codex desktop app's native macOS notification for every completed turn and stop invoking the legacy `notify_codex_turn.sh` hook.

## Current State

- The user-level Codex configuration is symlinked to `mac/codex_config.toml` in this repository.
- Its `notify` key invokes the Computer Use turn-ended wrapper, which preserves and calls `mac/notify_codex_turn.sh`.
- The script uses `terminal-notifier`, labels alerts `Codex.VSCode`, and activates Visual Studio Code.
- The desktop app has no persisted notification override, so it uses the app default of notifying only when unfocused.

## Considered Approaches

1. Use native Codex notifications and remove the legacy hook. This is the selected approach because it removes custom script maintenance and provides notifications owned by the desktop app.
2. Keep the legacy hook and set native notifications to always. This could produce duplicate notifications and retains the disliked script.
3. Replace the script with a smaller macOS notification command. This still depends on a custom hook and offers no benefit over the native app setting for this use case.

## Design

Remove only the top-level `notify` assignment from `mac/codex_config.toml`, preserving all unrelated existing changes. Persist the desktop app's `notifications-turn-mode` global-state setting as `always`. Do not delete `notify_codex_turn.sh`; leaving the now-unreferenced file avoids an unnecessary destructive change and preserves history until the user chooses to remove it.

Native notification permission remains controlled by macOS. Verify the Codex app preference after the setting change. If macOS has not granted notification permission, surface that as the only remaining manual action rather than restoring the script.

## Verification

- Confirm `mac/codex_config.toml` no longer contains a top-level `notify` key.
- Confirm the Codex global-state value for `notifications-turn-mode` is `always`.
- Confirm the legacy script is no longer referenced by active Codex configuration.
- Preserve all unrelated pre-existing edits in `mac/codex_config.toml`.
- Report whether macOS notification authorization can be verified programmatically; otherwise direct the user to the exact System Settings location.
