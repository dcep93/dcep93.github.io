# API contract and evidence

Inspected 2026-11-25 against local STS2 **v0.114.0**, commit **a7b9a9c0**, Steam build **26909018**, public-beta, Apple Silicon. Game assembly targets .NET 9; installed game runtime is 9.0.7. Draft build SDK: 9.0.321. IL inspection: ILSpyCmd 9.1.0.7988. The initial API checks were offline and did not control the running game. Subsequent save-recovery evidence is documented below.

## Existing mod references

Read as API usage references; implementation here is original, not a vendored copy of either mod.

- [Map Color Mod](https://github.com/JasonSongHoho/sts2_map_mod/tree/1d87cb3afaf7a5da84fb76322094aa8f5db3fe49): initializer attribute, `RefreshColorInstantly`, `map_color`, per-instance shader material ownership, and why root modulation/outline overrides are unsafe. Its released version avoids boss/ancient tinting. Our special-node handling uses independently inspected current game contracts.
- [AutoPath](https://github.com/jadistanbelly/autopath-sts2/tree/e5d6212a60c0faa53de414e8aa6113dd89e3e735): plain .NET assembly, Harmony owner, manifest, and optional rather than mandatory config dependency. No autoplay behavior has been adopted.
- [Community modding contract](https://github.com/Alchyr/ModTemplate-StS2/wiki/Modding-Basics): manifest conventions and macOS executable-relative `mods` directory.
- [Godot 4.5 PCK reader](https://github.com/godotengine/godot/blob/4.5/core/io/file_access_pack.cpp): read-only pack directory parsing used by the offline scene checker.

## Loader

Inspected `ModManager`, `ModManifest`, and `ModInitializerAttribute` in the installed assembly. The loader recursively reads `.json` manifests below the executable's `mods/` directory. It resolves the DLL by mod ID and invokes the method named by `[ModInitializer]`. Our initializer is public/static/no-argument. Settings are `settings.json.txt` to avoid manifest discovery. No `.pck` is needed because all art/shaders are already provided by the installed game.

## Save migration and cloud sync

First-use logs on 2026-11-25 showed `ModManager` copying unmodded saves into `modded/`, followed by cloud sync deleting the copied progress, current run, preferences, and history because those paths did not exist remotely. The game then created fresh modded progress. The original unmodded files remained intact. The same log confirmed successful initialization of spire420 and all six MapColors hooks; this save loss occurred in the game's migration/synchronization path.

Read-only inspection of `SaveManager`, `CloudSaveStore`, and `SteamRemoteSaveStore` confirmed:

- Cloud-to-local synchronization treats remote absence as deletion of the local file and its backup. A newer local timestamp alone does not protect a restored file.
- Local-only run history is retained when the local and cloud progress files have the same readable `unique_id`; absent or mismatched IDs permit its removal.
- Steam save filenames use paths such as `modded/profile1/saves/progress.save`, without the local Steam account directory prefix. Writes use `SteamRemoteStorage.FileWrite`, with batch begin/end support.
- `ShouldOverwriteCloudWithLocal` selects upload when cloud sync is disabled, or when local profile data exists and the entire cloud backend has no files. An empty modded profile does not imply that the entire backend is empty.

Recovery was performed with the game closed, after backing up local saves and Steam's cache. The original profile was copied into the separate modded profile; a temporary helper outside this repository restored its non-backup files through Steam's save API and verified every file by read-back. Vanilla files were checked for byte equality before and after. No recovery logic or save-writing hooks were added to spire420.

## Hooks and state

| Exact hook | Purpose |
| --- | --- |
| `NNormalMapPoint.RefreshColorInstantly(): void` postfix | Reapply room fill color after the game resets its shader. |
| `NBossMapPoint.RefreshColorInstantly(): void` postfix | Recolor the existing boss shader or placeholder art. |
| `NMapLegendItem._Ready(): void` postfix | Match the six legend icons to the palette. |
| `NAncientMapPoint.get_TraveledColor(): Color` postfix | Ancient's reachable/visited tint through the game's own animation target. |
| `NAncientMapPoint.get_UntravelableColor(): Color` postfix | Ancient's unavailable tint and reduced alpha. |
| `NAncientMapPoint.get_HoveredColor(): Color` postfix | Same Ancient hue on hover; no delayed retint timers. |

The contract checker reflects each exact declared method with its return type and empty parameter list. Private fields are verified with their exact types: boss `_usesSpine: bool`, `_material: ShaderMaterial`, `_animController: MegaSprite`; legend `_pointType: MapPointType`.

`MapPointType` distinguishes `Unknown` from `Unassigned`; we do not infer hidden outcomes or tint arbitrary custom types. Normal nodes call refresh after `%Icon` initialization in `_Ready`. The refresh updates `SelfModulate`, outline modulation, and `map_color`; its postfix changes only the fill parameter on a private material. Hover/selection animations alter icon alpha/scale and outline modulation, not this fill parameter, so no frame loop or timers are needed.

Normal icon scene: `%Icon` is `IconContainer/Icon`, `%Outline` is `IconContainer/Icon/Outline`. Native shader exposes `initial_color` and `map_color`. Native dark artwork remains the contrast boundary. The draft reuses existing outlines instead of replacing the shader or adding extra artwork. The legend uses the same atlas artwork without a material; it receives the game's normal icon shader and the verified `initial_color` constant. Neither labels nor hover behavior are altered.

Boss Spine art uses `map_color` plus `black_layer_color`. Clone its material, assign it through `MegaSprite.SetNormalMaterial`, and update the boss's cached field so future refreshes target the clone. Keep `black_layer_color` unchanged because it communicates visited/unavailable state. Placeholder bosses have `%PlaceholderImage`; its hue is changed after native refresh while preserving base alpha and reducing unavailable opacity.

Ancient scenes use `Icon` and `Icon/Outline`, with native getter-driven color tweens. Change only the three getter results, keeping native alpha and reducing unavailable alpha to 55%. Native outlines, scale tweens, inputs, and controller selection remain game-owned.

## Failure and ownership rules

Validate all six hook signatures before patching. Use the owner `dcep93.spire420.MapColors`; rollback that owner's patches if initialization fails. Per-point scene mismatches log once per distinct error and keep unsupported visuals vanilla. Exact runtime types only: custom subclasses are not modified. A per-owner weak table holds cloned materials so nodes cannot recolor each other. No root-level tint, gameplay callbacks, or per-frame work.

API signature checks cannot prove shader output or Harmony runtime behavior. They catch missing/renamed/type-changed hooks; game updates can preserve signatures while changing meaning. Offline tests and a successful build are prerequisites, not in-game acceptance. The user's visual testing remains pending, including f.lux warmth, boss artwork, availability cues, and co-op display.

Independent review also checked the native texture/shader mask: Shop and Rest have relatively small recolorable regions, so their accents may need strengthening after the user's f.lux test. Retaining the native mask is intentional for this first draft; it preserves the dark artwork. The legend now validates its material-free scene and both shader uniforms before assignment, and refuses unexpected subsequent material replacement.

## Validation record

Run `python3 scripts/mod.py check` to refresh the offline record. Source-only tests cover enabled defaults, partial and invalid settings, module failure isolation, inert autoplay, manifest/entry agreement, hook/field contracts, PCK scene/shader contracts, and deployment/rollback with settings preservation. Deployment validates the installed DLL hash. No claim of actual in-game loading is made until a later user-controlled restart.
