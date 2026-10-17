# Visible Short tracking and timing diagnostics

The user approved limiting the autoscroller to the visible Short and adding timing logs after an advance reportedly cut off several seconds. Existing logs only preserve a computed remaining time; they cannot establish the original cause.

Select the renderer closest to the viewport center among renderers with more than half their area visible. Select a visible, ready video only inside that renderer, with no document-wide fallback. Reject a renderer whose explicit Short link disagrees with the current URL. Wait through unavailable or ambiguous selections; do not start completion advances during paused playback or seeks. Reset timing comparisons when the selected player, source, or URL changes. Keep the existing end threshold and low-like policy.

Use geometry instead of relying solely on `is-active`: the inspected live renderer has no such attribute. A document-wide playing-video fallback would preserve the reported failure mode, so exclude it. Scope Like checks to the selected renderer as well.

Serialize diagnostics as JSON. Record real capture timestamps, URL and renderer identity, stable player IDs, source, playback position, duration, remaining time, threshold, progress, rate, paused/seeking/ended/loop state, readiness, visibility, and recent timing samples. Emit periodic samples every five seconds, changes immediately, and a bounded one-second sample history with each advance attempt.

Verify offscreen, hidden, unrelated, stale-identity, partially visible, and unready players with behavioral tests. Verify timing history/reset and serialized advance diagnostics with a simulated polling integration test. Run existing YouTube tests and syntax checks. Inspect the selector against the open Chrome DOM without modifying playback.

Self-review: scope and acceptance criteria are concrete; no open design decisions. Commit and push only task-owned changes on master.

Validation: all 21 Node tests pass, including simulated polling with an offscreen ending player and a visible player with ten seconds remaining. Syntax and whitespace checks pass. Initial live DOM inspection confirmed a visible renderer with a matching Short link and no `is-active` attribute. The browser tab became unavailable before final live validation; the updated running extension has not been verified.
