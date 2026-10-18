# Shorts auto-scroll reliability

## Evidence and expected behavior

AUTO enables advancing when the visible Short finishes. On the user's live
YouTube tab, the extension repeatedly logged `clicked:false` after reaching the
end. The enabled Next video button remained inside the active `ytd-shorts`, but
its `.navigation-container` had `display:none` in the narrow window layout.
The existing visibility filter rejected it indefinitely.

Polling also requires 99.5% playback progress while running every 120 ms. For a
10-second looping Short, the eligible window is only 50 ms, so consecutive polls
can miss it. A non-looping video marked both ended and paused is also rejected
before the completion check. Regression tests reproduced all three failures.

## Fix

Keep the current visible-player selection, near-end threshold, progress guard,
500 ms navigation retry limit, URL-change verification, and destination Like
filter. Resolve navigation controls only within the selected player's
`ytd-shorts`. Prefer a visible enabled Next video button. When none is visible,
accept the single enabled candidate only if it belongs to
`#navigation-button-down`. Do not use document-wide hidden controls or synthetic
keyboard/scroll navigation.

Recognize a completed loop from consecutive timing samples of the same player,
source, and URL: unchanged duration and positive playback rate, neither sample
paused/seeking, a transition from the last 10% to the first 10%, and elapsed
playback sufficient to cross the boundary. Reject samples more than two seconds
apart. This detects completion after the boundary rather than widening the early
advance threshold. Allow ended videos through the paused guard.

Alternatives considered: removing all navigation visibility checks would risk
selecting unrelated controls; widening the completion threshold would weaken
the existing protection against early advances. The scoped control and bounded
loop recognition address the failures while retaining those protections.

## Verification

Run the Node suite, JavaScript syntax checks, and whitespace checks. Cover hidden,
disabled, ambiguous, missing, and unrelated navigation controls; retry recovery;
loop boundaries at 1x, 2x, and 4x; rewinds, source/duration changes, paused/seeking
playback, stale observations, and ended-and-paused videos.

Live verification after reloading the YouTube tab: sought to 98% using its visible
seek bar, then observed extension logs reporting `clicked:true` and a matching
`destination-observed` transition. A second automatic transition also succeeded
with the navigation button hidden. AUTO remains the enabled/disabled toggle.

Self-review: focused on the reproduced navigation and completion failures;
existing visible-player and Like-filter behavior is preserved. No open design
decisions. Commit and push only the task-owned files on master.
