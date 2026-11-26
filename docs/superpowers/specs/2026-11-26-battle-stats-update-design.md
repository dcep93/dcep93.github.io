# spire420 battle statistics update

Approved November 26, 2026 with `yesi`; placement corrected by Daniel to below the build information. Codex agents own builds and installation. Do not interrupt, focus, quit, launch, or send input to the running game.

## Behavior

- Place the combat-only statistics immediately below the native top-right build/version/modded information, right aligned, larger than the previous 22px text, white with dark outline and no opaque panel. Derive placement from the native label bounds in the overlay parent's coordinate system; preserve mouse passthrough and overlay/menu visibility rules. Recalculate on refresh for resizing. A safe top-right fallback is acceptable if the native label is unavailable, with one diagnostic.
- Display `今7 σ12.4 中10 #23 力30`. 今 remains the game's local-player damage-taken statistic, including self-damage and excluding healing adjustments. The suffix is the sum of living enemy attack intents using native modified damage and repeat counts, before player block. Nonattack intents contribute zero. Hidden/unknown attacks yield an unknown total (`力?`) rather than fabricated certainty. Displayed intent totals are previews, not a promise about the eventual enemy turn.
- Historical means, medians and counts are grouped by exact encounter and native game mode (Standard, Daily, Dread, Blitz); characters and difficulty levels remain pooled. Preserve the mode in live samples and read-only current-run projections as well as completed run imports.
- Upgrade the mod-owned database without modifying native saves. Keep existing sample keys for deduplication. Preserve legacy samples with unknown mode, exclude them from known-mode summaries, and reclassify those recoverable from native run history by upserting the same key. Absent history mode follows the native RunHistory default Standard; explicit invalid/unrecognized values must not silently become Standard. Back up the old database before replacement. Never seed or migrate the active database externally while the old game process is writing it; the new runtime performs migration after Daniel restarts.
- Keep every module enabled by default. Autoplay remains inert. Preserve installed settings byte-for-byte.

## Black rectangle investigation

The user observes a transient black rectangle, particularly during Defect orb evocations. Cause is unknown; do not attribute it to spire420 without evidence. Inspect local logs, mod material ownership and native VFX/shader paths read-only. Asset-cache warnings alone are not proof of rendering failure. Only ship a rendering fix if its cause and scope are supported; otherwise record findings and a concrete next capture/isolation step. No speculative global rendering changes, renderer switches, or disabled effects.

## Agent handoff and delivery

Add a discoverable local AGENTS.md linking operational documentation. Record source/install paths, build/check/install command, restart requirements, settings preservation, backup/rollback location, database migration, log location, current release and verification, unresolved black-square report, and native testing status. Future agents should install authorized changes themselves, never hand Daniel a shell task. Follow repo defaults: default branch, preserve unrelated edits, commit and push completed task-owned work.

## Verification

Offline tests cover mode isolation, legacy upgrade/reimport deduplication and backup, malformed modes, current-run projection, intent aggregation with multi-hit/modifiers/unknown/dead enemies, formatting, placement math, installed game API contracts, existing module and installer regression checks. Do not launch Godot or exercise the live game. Verify installed DLL hash, manifest version and unchanged settings; native layout and effects remain Daniel's visual acceptance.
