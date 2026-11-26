# spire420 operational handoff

Daniel requested that this documentation support future Codex agents. Agents own installation; Daniel owns gameplay/visual acceptance and restarting when convenient. Do not hand him terminal work.

## Source, tools and installed package

- Source: `/Users/danielcepeda/repos/dcep93.github.io/games/slay-the-spire-2` on repo default branch `master`.
- Installed package: `/Users/danielcepeda/Library/Application Support/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.app/Contents/MacOS/mods/spire420/`.
- Native managed API: the same app's `Contents/Resources/data_sts2_macos_arm64/` (`sts2.dll`, `GodotSharp.dll`, `0Harmony.dll`). Current inspected game: v0.114.0 public-beta, commit a7b9a9c0.
- SDK: `/Users/danielcepeda/.local/share/sts2-dev/dotnet/dotnet` (.NET9). Installer discovers it automatically.
- ILSpy: `/Users/danielcepeda/.local/share/sts2-dev/tools/ilspycmd`; set `DOTNET_ROOT=/Users/danielcepeda/.local/share/sts2-dev/dotnet DOTNET_ROLL_FORWARD=Major` for execution.
- Local-only research: `/Users/danielcepeda/.cache/sts2-draft/` (decompiled classes, reference mods, selected PCK scenes, installation evidence). Do not commit game assets or source.
- Live log: `/Users/danielcepeda/Library/Application Support/SlayTheSpire2/logs/godot.log`; rotated logs share that directory. Read-only inspection is allowed while playing.

## Updating an authorized change

1. Read this handoff and the API contract; inspect working-tree status and installed release. Preserve unrelated work. All module keys default enabled when omitted from installed settings.
2. Implement against the installed game assemblies. Keep API-contract validation and meaningful tests current. Do not invoke the game or native engine from the checker.
3. Update `spire420.csproj`, `spire420.json`, `Entry.cs`, README and version checks consistently. Record user-visible behavior and unresolved issues here.
4. Capture old DLL/settings hashes, then run from the source directory:

   ```sh
   python3 scripts/mod.py install
   ```

   This builds Release, checks actual PCK contracts, runs managed API/data/Harmony tests and Python installer tests, then deploys only spire420. A build-only or check-only run is not installation.
5. Verify installed DLL SHA-256 equals `bin/Release/net9.0/spire420.dll`, manifest version matches, installed `settings.json.txt` is byte-identical, and the old package exists in the printed backup directory. Never overwrite preferences with source defaults.
6. Commit/push only task-owned files under repository defaults. Tell Daniel installed version and restart requirement. Do not restart for him. After his next launch, logs should contain `[spire420] Draft <version> initialized` and enabled-module messages; that establishes loading, not visual correctness.

The installer copies the DLL, manifest, preserved settings and README. Settings intentionally use `.json.txt`: the native loader recursively treats `.json` files in `mods/` as manifests. Do not leave renamed old packages, backups, or extra JSON diagnostics under `mods/`.

## Package rollback

Backups are under the app's `Contents/MacOS/mod-backups/spire420/<UTC timestamp>/`, outside the recursive loader. Only after Daniel closes the game, replace the recognized `mods/spire420` directory with a chosen backup. Preserve current settings separately and consider data-schema compatibility before rolling back. Do not restore or migrate native saves as part of a package rollback.

## Battle statistics and migration

The local-only mod database is under `/Users/danielcepeda/Library/Application Support/SlayTheSpire2/spire420/battle-stats/`; it is outside the native account/profile tree and not Steam-synced. Filename is SHA-256 identity of absolute active profile path plus `Progress.UniqueId`. Active modded profile1's original database filename is `84ff33956f97fee46d67bc1b4b636500d1aa36e3a9ebd6e0484f4199d6661a8e.json`, but derive identity again if the profile resets or changes.

0.3.0 stored mode-free samples. 0.4.0 migrates these to unknown-mode samples and recovers modes by reimporting the active profile's native `saves/history/*.run` as read-only input. Same battle keys allow replacement without duplicates. Unrecoverable samples remain preserved but excluded from Standard/Daily/Dread/Blitz summaries. Current-run projections and new live samples retain actual mode; character/difficulty remain pooled. Migration happens inside the new runtime after Daniel restarts, never by an external importer alongside the old runtime. Native save files must remain untouched.

Schema2 stores numeric modes (`Unknown=0`, `Standard=1`, `Daily=2`, `Dread=3`, `Blitz=4`). Migration preserves original schema1 bytes in `<database>.schema1.bak`; normal subsequent writes rotate `<database>.bak`. Rolling a package back to 0.3.0 leaves schema2 intact: its old reader will preserve the unsupported database and disable disk writes. Do not overwrite newer samples with the old backup just to remove that warning; plan any data rollback separately.

The optional `tools/BattleStatsImport` CLI shares production import/store code. Use `--dry-run` for read-only inspection, or use a scratch database outside the active directory for migration experiments. A non-dry import of the active database requires the game to be closed. Avoid simultaneous writers even with the store's external-change refusal.

## Save recovery history — do not repeat during ordinary updates

During first mod activation on November 25, the game's own modded-profile migration was followed by Steam synchronization deleting new local modded files absent remotely. Original unmodded saves remained intact. After Daniel closed the game, both local and Steam modded copies were restored successfully. Full backup: `/Users/danielcepeda/Library/Application Support/spire420-recovery/20261125T081109Z`. Account `76561198403057138`, original profile unique ID `U5NTZG9`.

This is resolved, not a required install step. Never blindly copy vanilla saves into modded, edit `remotecache.vdf`, or restore a stale recovery backup. Steam remote absence can delete locally copied saves; any future recovery needs a fresh backup and evidence-based cloud reconciliation. See API contract's save migration section.

## Black rectangle report (unresolved)

Reported November 26: transient black square covering part of combat, especially during Defect orb evocations. Daniel explicitly does not know whether spire420 is involved. No capture of the artifact or reproducible sequence was supplied; the provided image demonstrates the old overlay overlapping relics, not the rectangle.

Evidence from read-only inspection:

- Game log shows Metal 3.2 Forward+ on Apple M5. spire420 0.3.0 loaded successfully; no mod error accompanied inspected orb warnings.
- Numerous `Asset not cached` warnings include orb scenes, images and audio but also ordinary game assets. These indicate cache misses, not proof of missing files or a shader failure. No shader compilation failure was found in the inspected active log.
- `ERROR: Invalid Task ID` occurred around post-run main-menu/preload transitions; that timing does not establish a connection to an in-combat rectangle.
- spire420's map tint code duplicates map materials and patches map nodes only. BattleStats adds a Label/Timer with no background. No module patches native orb effects, screen copies or VFX shaders. This reduces the direct avenues for an effect replacement but does not prove the mod uninvolved.
- Native `scenes/vfx/orbs/glass/vfx_glass_orb_evoke.tscn` and `_impact.tscn` contain a `BackBufferCopy` and instantiate `scenes/vfx/common/vfx_screen_chromatic_aberration.tscn`. Its shader `shaders/vfx/common/vfx_screen_chromatic_aberration_shader.gdshader` samples `hint_screen_texture` and writes opaque output across its particle quad. This is a candidate screen-space effect to inspect if a capture implicates glass; it is not a demonstrated defect or confirmed cause. Frost/dark/lightning scenes also use native particle/material paths, with no mod replacement found.
- Research text is cached at `/Users/danielcepeda/.cache/sts2-draft/effects-research/`, outside Git.

Next useful evidence is Daniel's screenshot/short recording when the square appears, orb/card involved, its position/duration and approximate time to correlate logs. Do not pause his game to obtain it. If later isolation is needed, an agent can prepare module toggles for an agreed user-controlled restart, preserving settings and staying in the modded profile; disabling the entire package switches save context and is not a casual diagnostic step. Do not change renderer, GPU settings, shaders or disable effects on speculation.

## Native acceptance and pending scope

0.3.0 was observed live by Daniel. Its label overlapped top-left relics; 0.4.0 moves it below build information at his request. New placement, glyph rendering, mode buckets and intent totals need his next in-game check. Offline contracts/tests do not replace that acceptance. `Σ?` during hidden or frozen/fading intent transitions is deliberate; the native intent display freezes before some enemy actions, so recalculating through that interval can disagree with the displayed values. The black rectangle remains unresolved, with no rendering workaround shipped. Autoplay is enabled but inert until Daniel supplies conditions.

## 0.4.0 migration verification (November 26, 2026)

The production importer was exercised on a **scratch copy**, not the active database, at `/Users/danielcepeda/.cache/sts2-draft/battle-update/migration-check/`. It upgraded schema1 to schema2, preserved all 7,961 original keys, damage values and encounter IDs, classified 7,926 Standard/23 Daily/9 Dread samples, and retained 3 unknown records. These matched an independent eligibility count from 1,360 native history files. A second import changed zero samples. The durable `.schema1.bak` matched the original snapshot SHA-256 exactly. Evidence: `snapshot-evidence.txt` and `verification.txt` in that scratch directory. Counts are a dated snapshot, not a permanent expected value as Daniel continues playing.

## Installed release: 0.4.0 — November 26, 2026

- Build and installed DLL SHA-256: `9b63cbd58ab18a401a28dabc49b56cac1f2f3126b25fc481199eb3af909da41b`.
- Previous 0.3.0 package backup: `/Users/danielcepeda/Library/Application Support/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.app/Contents/MacOS/mod-backups/spire420/20261126T092046.316496Z`. Its DLL hash matched the preinstall package.
- Installer reran 43 managed checks, 7 actual scene/shader contracts and 6 Python installer tests, all passing; zero build warnings/errors. Spec and code-quality reviews approved the final implementation, including the frozen-intent guard.
- Installed manifest is 0.4.0; settings remained byte-identical. Active stats JSON hashes were unchanged across this installation; migration is deferred to the new runtime. Native saves were not written and the running game was not controlled.
- Installation evidence: `/Users/danielcepeda/.cache/sts2-draft/battle-update/install.log`, `install-before.json`, `install-verification.json`.
- Activation and native visual acceptance remain pending Daniel's next normal restart. Do not mistake this installed binary verification for a verified in-game layout or a black-rectangle fix.

## Installed release: 0.4.1 — November 26, 2026

Daniel requested sigma instead of the power glyph for enemy attack total. Display now reads `今7 σ12.4 中10 #23 Σ30`: uppercase `Σ` is the attack sum; lowercase `σ` remains historical mean. Unknown attack preview is `Σ?`. This is a label-only change; calculation, layout, database schema and lifecycle remain unchanged.

- Installed/build DLL SHA-256: `27ac7cbb1cde5d2eefd523b5e700bd762c75eec50c4f59610a99f86570c34b1a`.
- Previous 0.4.0 package backup: `/Users/danielcepeda/Library/Application Support/Steam/steamapps/common/Slay the Spire 2/SlayTheSpire2.app/Contents/MacOS/mod-backups/spire420/20261126T194829.568200Z`; old DLL verified against preinstall hash.
- 43 managed checks, 7 scene contracts, 6 installer tests passed. Installed settings preserved byte-for-byte; no game process control or save/database writes.
- Evidence: `/Users/danielcepeda/.cache/sts2-draft/sigma-label/install.log` and `verification.json`.
- Implementation commit: `4e2e96d`. Next user-controlled restart activates the updated label. Black-rectangle investigation remains unresolved as documented above.
