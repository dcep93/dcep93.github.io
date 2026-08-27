# YouTube Shorts Like Diagnostics Design

## Goal

Add focused console diagnostics to the Generic Extension's YouTube Shorts auto-advance and low-like filtering flow. The logs must reveal whether an auto-advanced destination became eligible for a Like-count check, whether the count was readable, and why the extension kept or skipped the Short. This change must not alter navigation, eligibility, retry, threshold, or skip behavior.

## Context

The extension advanced automatically to a Short that appeared unpopular but did not skip it. The current console output only reports a low-like Short when a skip is already happening. It does not distinguish among an expired transition, an unrecognized destination, an unreadable Like count, or a count at or above the 1,000-like threshold. Changing timing based on the observation alone would risk fixing the wrong cause.

## Approach

Instrument the existing state transitions instead of dumping DOM state or logging only successful count reads. Keep the existing `[shorts-autonext]` console prefix so the output remains easy to filter.

The auto-advance eligibility gate will accept an optional diagnostic callback. It will report these bounded lifecycle events:

- An extension advance records a source Short and starts a pending transition.
- The pending transition expires before a different active Short is observed.
- A different active Short is accepted as the eligible auto-advance destination.
- Destination eligibility is consumed after a readable Like count is obtained.
- Destination eligibility is cleared because a different Short becomes active.

The Like-count checker will report:

- The eligible destination's check being scheduled.
- Each bounded read attempt, including an unreadable `null` result.
- Retry exhaustion when no count becomes readable.
- A readable count with the configured threshold and the resulting `skip` or `keep` decision.
- Cancellation when the controller, URL, active video, enabled state, or eligibility changes before a delayed check runs.

Diagnostic payloads will use stable event names and small objects containing only relevant signatures, attempt numbers, counts, thresholds, and decisions. No DOM dumps or unbounded polling logs will be added.

## Behavior and Error Handling

Diagnostics are best effort. The optional callback will be isolated so a logging failure cannot interfere with the eligibility gate or playback. Existing debug logging remains controlled by the controller's `DEBUG` flag. Warnings continue to use the existing warning path.

All current functional behavior remains unchanged: only extension-initiated destinations are eligible, transition authorization lasts 1.5 seconds, Like reads use the existing delays and retry limit, Shorts with fewer than 1,000 likes are skipped, and readable counts consume eligibility.

## Testing

Extend the gate unit tests with a captured diagnostic stream and verify event emission for a recognized destination, consumption, transition expiry, and destination invalidation. Add source-level assertions for Like-check scheduling, attempts, retry exhaustion, decisions, and cancellation diagnostics. Run the complete YouTube extension test file after implementation.

