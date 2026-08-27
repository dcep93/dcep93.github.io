# YouTube Shorts Layout Repair Design

## Goal

Restore the Generic Extension's YouTube Shorts behavior after YouTube's action-bar layout migration: show a visible `AUTO` control, skip Shorts with fewer than 1,000 likes, and continue advancing when a Short finishes.

## Root Cause

YouTube now renders the visible Shorts controls inside `reel-action-bar-view-model`. The extension's UI lookup falls through to a generic `#actions` selector and inserts `AUTO` into a hidden legacy watch-page container instead of the active Short's visible action bar.

On the observed 36-like Short, the new visible Like button exposes `aria-label="like this video along with 36 other people"`. The existing parser can convert that label to `36`, but the low-like decision is gated behind an extension-initiated auto-advance window. The live extension therefore never invokes the decision for the active Short shown in the new layout.

## Design

### Active Shorts UI

Resolve the currently playing, visible video and its nearest `ytd-reel-video-renderer`. Within that active renderer, locate the visible `reel-action-bar-view-model` and its Like control. Do not use page-global `#actions` fallbacks.

Insert one extension-owned 48-pixel circular button as the first action-bar child, immediately above Like. The button reads `AUTO` when enabled and `OFF` when disabled. Reinitialization removes extension-owned controls outside the active action bar so obsolete hidden buttons cannot survive YouTube single-page navigation.

### Like Count and Skip Decision

Read the count only from the visible Like control inside the active renderer. Prefer the button's accessible label and fall back to the visible count label. Continue supporting plain and compact counts such as `36`, `1.2K`, and `2.3 million`.

Observe changes to the active Shorts renderer/action bar and poll at the existing low-frequency UI cadence as a fallback. Once a unique active video has a readable like count, record that video as checked. If the count is below 1,000 and auto mode is enabled, advance once. If the count is unavailable, retry for the existing bounded period without interpreting comments, remixes, or other nearby numbers as likes.

The check is driven by the active renderer and its Like control becoming ready, not by how the user arrived at the Short. This makes the behavior work after automatic advance, manual navigation, direct opening, and YouTube's single-page transitions.

### Auto-Advance

Keep the existing video-end polling and ended-event behavior. Continue trying Arrow Down, the visible `Next video` control, and scrolling as fallbacks. AUTO/OFF controls both end-of-video advancing and low-like skipping.

## Failure Handling

If no active renderer, visible action bar, Like control, or parseable count exists, leave the Short playing and retry later. Never skip based on a number outside the active Like control. Prevent duplicate advances with the existing in-flight guard and per-video signature tracking.

## Verification

- Confirm a fixture matching YouTube's new `reel-action-bar-view-model` structure receives one visible `AUTO` button above Like.
- Confirm the parser reads `36`, `1.2K`, and `2.3 million` from the active Like control.
- Confirm a 36-like Short triggers one skip while a 2.3-million-like Short does not.
- Confirm hidden legacy `#actions` containers do not receive the extension control.
- Reload the unpacked extension and the open 36-like Short in Chrome, then verify the bubble is visible and the Short advances.
- Verify a popular Short remains until playback ends and then advances normally.

