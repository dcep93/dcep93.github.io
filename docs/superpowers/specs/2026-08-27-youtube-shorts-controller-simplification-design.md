# YouTube Shorts Controller Simplification Design

## Goal

Replace the Generic Extension's overlapping YouTube Shorts auto-advance mechanisms with one persistent loop:

1. Watch the current Short until it finishes.
2. Click the visible Next video button until the Short identity changes.
3. Read and log the destination's Like count.
4. Advance again when the count is below 1,000; otherwise watch the destination until it finishes.

## Current Problem

The existing controller combines a near-end poll, an `ended` listener, synthetic Arrow Down events, a delayed global Next-button click, smooth scrolling fallbacks, cooldown state, a 1.5-second destination gate, and controller replacement after YouTube navigation events. A navigation attempt can run without changing the active Short, yet the controller clears its in-progress state without a durable verified retry. Navigation-triggered controller replacement can also discard the provenance needed for the destination Like check.

The observed page exposes one visible, enabled `Next video` button. The controller should use that direct control and verify success by observing the Shorts URL identity.

## State Model

Use one explicit state with three modes:

- `watching`: monitor the current Short for completion.
- `advancing`: retain the source Short identity, click the visible Next video button at a bounded interval, and remain in this mode until the identity changes.
- `checking`: retain the auto-advanced destination identity while its Like count is read.

The Short identity is the `/shorts/<id>` URL path. Unlike the current blob URL plus duration signature, this identity does not change when video metadata loads.

The controller persists across YouTube's single-page navigation events. Full page loads naturally create a new content-script controller. It is not reinitialized on `yt-navigate-finish`, `yt-page-data-updated`, `pageshow`, or `popstate`.

## Loop Behavior

The existing steady video-time poll remains the completion detector so playback-rate changes and delayed `ended` events do not matter. In `watching`, reaching the established near-end threshold enters `advancing`.

In `advancing`, every poll first checks whether the URL identity differs from the retained source. A changed identity enters `checking` and schedules one bounded Like-count read sequence. If the identity has not changed, the controller clicks the visible enabled Next video button no more than once every 500 milliseconds. It keeps retrying until navigation succeeds, AUTO is disabled, the user leaves Shorts, or the controller stops. Synthetic keyboard and scroll fallbacks are removed.

In `checking`, the controller uses the existing initial delay, retry delay, retry count, count parser, and 1,000-like threshold. A readable count is logged with a `skip` or `keep` decision. A low count enters `advancing` from that destination, preserving chained filtering. A high count or exhausted unreadable count returns to `watching`. If the active Short changes during the check, the check is cancelled and the controller returns to `watching`; eligibility never transfers.

Manual navigation while `watching` updates the watched identity but does not trigger a Like check. Disabling AUTO or leaving Shorts resets the mode to `watching` and cancels pending behavior.

## Diagnostics and Failure Handling

Keep the `[shorts-autonext]` prefix. Log state transitions, each rate-limited Next-button attempt and whether a visible button was found, destination recognition, bounded Like-count attempts, and final decisions. Logging remains best effort and must not affect playback.

If YouTube temporarily removes the Next video button, the controller stays in `advancing` and retries instead of pretending navigation succeeded. There is no short transition expiration and no silent final fallback.

## Testing

Replace the transition-gate unit tests with deterministic tests for the three-state flow:

- Initial and manual playback remain `watching`.
- Completion enters `advancing`.
- Advance attempts are rate limited but continue until the identity changes.
- A changed identity enters `checking` exactly once.
- A kept destination returns to `watching`.
- A low-like destination re-enters `advancing`, supporting chained filtering.
- Cancelling resets the controller without transferring destination eligibility.

Retain compact-count and Like-button parsing tests. Add source-level checks that the persistent bootstrap does not register navigation reinitializers, the visible Next video button is the only navigation mechanism, and the old transition gate, synthetic Arrow Down, and scroll fallbacks are absent. Run syntax and complete extension tests after implementation.

