# YouTube Shorts Auto-Advance Skip Gating Design

## Goal

Only apply the Generic Extension's low-like YouTube Shorts skip to a Short that began playing as the destination of an extension-initiated auto-advance. Preserve chained filtering: when an eligible low-like Short is skipped, the next Short is also eligible for the low-like check.

## Root Cause

The latest Shorts layout repair schedules the low-like check whenever it discovers a new active video and from the periodic UI poll. That fixed count discovery, but it removed the earlier arrival gate. As a result, a directly opened Short or one reached through manual navigation can be skipped even though the extension did not start that transition.

## Design

### Transition Provenance

Track one pending extension transition in the existing Shorts controller state. When `advance_next()` begins, store the active video's signature as the transition source. Do not immediately make the current video eligible.

When polling later observes a different active video signature, consume the pending transition and mark that destination signature as eligible for one low-like decision. A newly observed video without a matching pending extension transition is manual or initial playback and is not eligible.

Clear a pending transition if its destination does not appear within a bounded interval. This prevents an unsuccessful extension advance from making a later manual navigation eligible. The bound covers the existing Arrow Down, Next-button, and scroll fallbacks.

### Low-Like Decision

Keep the current active-renderer Like-button discovery, compact-count parsing, and bounded UI retries. `maybe_skip_low_like_video()` must require the active signature to equal the eligible destination signature before starting or continuing a check.

After a readable count is obtained, consume the eligibility regardless of whether the Short is below or above 1,000 likes. If it is below 1,000, call `advance_next()`; that creates a new pending extension transition and continues the filtering chain. If the count cannot be read within the retry budget, retain eligibility so a later UI poll can try again while the same destination remains active.

### Manual and Initial Playback

The first active Short after startup, a directly opened Short, and any Short reached by manual navigation have no extension transition provenance. They may still receive the AUTO/OFF control and normal end-of-video monitoring, but their Like count must not cause a skip.

### Auto Mode and Lifecycle

AUTO/OFF continues to control both end-of-video advancing and eligible low-like skipping. Reinitialization and stop logic discard pending transition and eligibility state with the controller. Existing duplicate-advance and cooldown protections remain unchanged.

## Failure Handling

If an extension advance does not change the active video before the transition expires, discard its pending provenance. If YouTube changes videos again before an eligible destination's Like count becomes readable, discard that destination eligibility rather than transferring it. Never infer eligibility solely from elapsed time or a `play` event.

## Verification

- Confirm initial and manually reached Shorts do not schedule a low-like skip.
- Confirm a destination reached after `advance_next()` is eligible exactly once.
- Confirm an eligible low-like destination starts another tracked extension transition, allowing chained skips.
- Confirm an expired or failed transition cannot authorize a later manual destination.
- Confirm active Like-button parsing and action-bar targeting tests continue to pass.
